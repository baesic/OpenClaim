use axum::{
    Router,
    extract::{Request, State},
    http::StatusCode,
    middleware::{self, Next},
    response::{IntoResponse, Response},
};
use rmcp::transport::{
    stdio,
    streamable_http_server::{
        StreamableHttpServerConfig, StreamableHttpService, session::local::LocalSessionManager,
    },
};
use rmcp::{ServiceExt, handler::server::wrapper::Parameters, schemars, tool, tool_router};
use std::sync::Arc;

#[derive(Clone)]
struct OpenClaim;

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
#[serde(deny_unknown_fields)]
struct TemplateChoice {
    /// Public template identifier only. Never send names, evidence or case details.
    kind: TemplateKind,
}

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
#[serde(rename_all = "snake_case")]
enum TemplateKind {
    Inquiry,
    Compensation,
    Mediation,
}

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
#[serde(deny_unknown_fields)]
struct Empty {}

#[tool_router(server_handler)]
impl OpenClaim {
    #[tool(
        description = "List public self-claim preparation choices and official information links. No private case data is accepted or returned.",
        annotations(read_only_hint = true, open_world_hint = false)
    )]
    fn openclaim_choices(&self, Parameters(_): Parameters<Empty>) -> String {
        openclaim_core::catalog().to_string()
    }

    #[tool(
        description = "Get a blank Korean request template. Fill personal information only in your local browser, outside AI chat. No submission is performed.",
        annotations(read_only_hint = true, open_world_hint = false)
    )]
    fn openclaim_template(&self, Parameters(choice): Parameters<TemplateChoice>) -> String {
        let kind = match choice.kind {
            TemplateKind::Inquiry => "inquiry",
            TemplateKind::Compensation => "compensation",
            TemplateKind::Mediation => "mediation",
        };
        openclaim_core::blank_template(kind)
            .expect("closed enum")
            .to_string()
    }
}

// This service exposes public templates only. The gate still prevents remote
// websites from invoking a user's loopback service through DNS rebinding.
async fn gate(State(token): State<Arc<String>>, req: Request, next: Next) -> Response {
    let host_ok =
        req.headers().get("host").and_then(|h| h.to_str().ok()) == Some("127.0.0.1:31415");
    let origin_ok = !req.headers().contains_key("origin");
    if !host_ok || !origin_ok {
        return StatusCode::FORBIDDEN.into_response();
    }
    let expected = format!("Bearer {token}");
    if req
        .headers()
        .get("authorization")
        .and_then(|h| h.to_str().ok())
        != Some(expected.as_str())
    {
        return StatusCode::UNAUTHORIZED.into_response();
    }
    next.run(req).await
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().skip(1).collect();
    match args.as_slice() {
        [] => {
            OpenClaim.serve(stdio()).await?.waiting().await?;
        }
        [arg] if arg == "--http" => {
            let token = std::env::var("OPENCLAIM_MCP_TOKEN").map_err(
                |_| "Set OPENCLAIM_MCP_TOKEN to a random value of at least 32 characters",
            )?;
            if token.len() < 32
                || !token
                    .bytes()
                    .all(|b| b.is_ascii_alphanumeric() || b"-_.".contains(&b))
            {
                return Err(
                    "Token must contain at least 32 ASCII letters, digits, -, _, or .".into(),
                );
            }
            let mut config = StreamableHttpServerConfig::default().enforce_origin_validation();
            config.allowed_hosts = vec!["127.0.0.1:31415".into()];
            let service = StreamableHttpService::new(
                || Ok(OpenClaim),
                Arc::new(LocalSessionManager::default()),
                config,
            );
            let router = Router::new()
                .nest_service("/mcp", service)
                .layer(middleware::from_fn_with_state(Arc::new(token), gate));
            let listener = tokio::net::TcpListener::bind("127.0.0.1:31415").await?;
            eprintln!("OpenClaim public-guidance MCP listening on http://127.0.0.1:31415/mcp");
            axum::serve(listener, router)
                .with_graceful_shutdown(async {
                    let _ = tokio::signal::ctrl_c().await;
                })
                .await?;
        }
        [arg] if arg == "--version" => println!("openclaim-mcp {}", env!("CARGO_PKG_VERSION")),
        _ => return Err("Usage: openclaim-mcp [--http | --version]".into()),
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use tower::ServiceExt as _;
    async fn status(host: &str, origin: Option<&str>, auth: bool) -> StatusCode {
        let app = Router::new()
            .route("/mcp", axum::routing::post(|| async { "ok" }))
            .layer(middleware::from_fn_with_state(
                Arc::new("a".repeat(32)),
                gate,
            ));
        let mut req = Request::builder()
            .method("POST")
            .uri("/mcp")
            .header("host", host);
        if let Some(o) = origin {
            req = req.header("origin", o);
        }
        if auth {
            req = req.header("authorization", format!("Bearer {}", "a".repeat(32)));
        }
        app.oneshot(req.body(axum::body::Body::empty()).unwrap())
            .await
            .unwrap()
            .status()
    }
    #[tokio::test]
    async fn restricts_local_http_access() {
        assert_eq!(status("127.0.0.1:31415", None, true).await, StatusCode::OK);
        assert_eq!(
            status("127.0.0.1:31415", None, false).await,
            StatusCode::UNAUTHORIZED
        );
        assert_eq!(
            status("evil.invalid", None, true).await,
            StatusCode::FORBIDDEN
        );
        assert_eq!(
            status("127.0.0.1:31415", Some("https://evil.invalid"), true).await,
            StatusCode::FORBIDDEN
        );
    }
}
