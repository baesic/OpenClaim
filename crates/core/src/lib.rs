//! Network-free claim preparation. Private drafts never enter the MCP surface.
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

fn guidance_data() -> Value {
    serde_json::from_str(include_str!("../../../data/kr-response-guide.json"))
        .expect("validated public guidance data")
}

pub fn guidance_index() -> Value {
    let mut guide = guidance_data();
    guide["scenarios"] = Value::Array(guide["scenarios"].as_array().unwrap().iter().map(|s| {
        json!({"id":s["id"],"title":s["title"],"summary":s["summary"],"urgency":s["urgency"],"template_kind":s["template_kind"]})
    }).collect());
    guide
}

pub fn response_plan(scenario: &str, incident: &str) -> Result<Value, &'static str> {
    let guide = guidance_data();
    let scenario = guide["scenarios"]
        .as_array()
        .unwrap()
        .iter()
        .find(|s| s["id"].as_str() == Some(scenario))
        .ok_or("지원하는 공개 대응안 식별자를 선택하세요.")?;
    let incident_context = if incident == "generic" {
        Value::Null
    } else {
        guide["incidents"]
            .as_array()
            .unwrap()
            .iter()
            .find(|i| i["id"].as_str() == Some(incident))
            .ok_or("지원하는 공개 공지 식별자를 선택하세요.")?
            .clone()
    };
    let mut route_ids: std::collections::BTreeSet<String> = std::collections::BTreeSet::new();
    let mut source_ids: std::collections::BTreeSet<String> = std::collections::BTreeSet::new();
    for action in scenario["actions"]
        .as_array()
        .unwrap()
        .iter()
        .chain(std::iter::once(&incident_context))
    {
        for (key, set) in [
            ("route_ids", &mut route_ids),
            ("source_ids", &mut source_ids),
        ] {
            if let Some(ids) = action[key].as_array() {
                set.extend(ids.iter().filter_map(|v| v.as_str().map(str::to_string)));
            }
        }
    }
    let routes: Vec<Value> = guide["routes"]
        .as_array()
        .unwrap()
        .iter()
        .filter(|r| route_ids.contains(r["id"].as_str().unwrap()))
        .cloned()
        .collect();
    for route in &routes {
        source_ids.extend(
            route["source_ids"]
                .as_array()
                .unwrap()
                .iter()
                .map(|v| v.as_str().unwrap().to_string()),
        );
    }
    let sources: Vec<Value> = guide["sources"]
        .as_array()
        .unwrap()
        .iter()
        .filter(|s| source_ids.contains(s["id"].as_str().unwrap()))
        .cloned()
        .collect();
    Ok(
        json!({"as_of":guide["as_of"],"review_due":guide["review_due"],"notice":guide["notice"],"privacy":guide["privacy"],"cost_policy":guide["cost_policy"],"selection_note":"선택한 공개 대응안입니다. 사용자 본인의 피해 인정·신청·전송을 수행하지 않습니다.", "scenario":scenario,"incident_context":incident_context,"routes":routes,"sources":sources}),
    )
}

pub fn catalog() -> Value {
    json!({
        "version": env!("CARGO_PKG_VERSION"),
        "purpose": "AI Agent에 개인정보 유출 대응안·신청 방법·빈 양식을 제공하는 MCP·Skill 도구 모음",
        "product_type": "agent_toolkit",
        "modes": ["local_mcp", "browser_wasm", "skill_only"],
        "service_page": {"role":"distribution_and_integration", "entry":"index.html", "browser_runtime":"browser.html", "optional_private_workspace":"workspace.html", "manifest":"service.json"},
        "choices": [
            {"id":"inquiry", "label":"유출 여부 확인", "description":"개인별 유출 여부와 항목 확인 요청"},
            {"id":"compensation", "label":"보상 검토 요청", "description":"확인된 사실에 따른 보상 기준과 검토 요청"},
            {"id":"mediation", "label":"분쟁조정 초안", "description":"사용자가 직접 검토·제출할 신청 초안"}
        ],
        "privacy": "개인정보는 MCP 인수·결과에 입력하지 마세요. 브라우저의 로컬 작성 기능에서만 처리하세요.",
        "submission": "사용자가 자신의 메일 또는 기관 사이트에서 직접 제출합니다. 자동 접수·대리·합의 기능은 없습니다.",
        "guidance": {"index_tool":"openclaim_guidance_index","plan_tool":"openclaim_response_plan","as_of":"2026-10-30","description":"상황별 대응 선택지·증빙·기관별 신청 방법과 공개 공지별 안내"},
        "sources": [
            {"label":"개인정보분쟁조정위원회", "url":"https://www.kopico.go.kr/"},
            {"label":"개인정보 포털", "url":"https://www.privacy.go.kr/"},
            {"label":"개인정보침해신고센터", "url":"https://privacy.kisa.or.kr/"}
        ],
        "source_note": "공개 안내 경로입니다. 사건별 접수 조건·서식·비용·보상 가능성은 이용 시 공식 기관에서 직접 확인하세요."
    })
}

pub fn blank_template(kind: &str) -> Result<&'static str, &'static str> {
    match kind {
        "inquiry" => Ok(
            "[사업자명] 담당자께\n\n개인정보 유출 안내를 받은 [성명]입니다. 본인의 유출 여부, 유출 항목·시점 및 보호 조치를 확인하여 회신해 주시기 바랍니다.\n\n회신 연락처: [사용자가 로컬에서 입력]\n확인된 사실: [사용자가 로컬에서 입력]\n",
        ),
        "compensation" => Ok(
            "[사업자명] 담당자께\n\n[성명]의 개인정보 유출 관련 보상 검토를 요청합니다.\n확인된 사실: [사용자가 로컬에서 입력]\n피해 확인 상태: [미확인 / 확인된 손해]\n요청 사항: 개인별 유출 여부, 보상 검토 접수 여부·접수번호, 배상 기준과 필요한 증빙을 회신해 주시기 바랍니다.\n추가 피해가 확인되는 경우의 권리를 포기하는 취지가 아닙니다.\n",
        ),
        "mediation" => Ok(
            "개인정보 분쟁조정 신청 초안 — 공식 신청서가 아닙니다\n\n신청인: [성명]\n피신청인: [사업자명]\n신청 이유: [확인된 사실과 경과]\n희망 구제: [본인이 선택한 요구]\n피해 및 증빙: [확인된 범위만 입력]\n공식 접수 조건·서식·필수 항목을 확인하고 본인이 직접 제출하세요.\n",
        ),
        _ => Err("지원하지 않는 양식입니다. inquiry, compensation, mediation 중 선택하세요."),
    }
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LossStatus {
    Unknown,
    NoConfirmedLoss,
    Confirmed,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct DraftInput {
    pub kind: String,
    pub name: String,
    pub contact: String,
    pub company: String,
    pub facts: String,
    pub loss_status: LossStatus,
    pub amount_krw: Option<u64>,
    pub requested_remedy: String,
    pub evidence: String,
}

pub fn render_draft(input: &DraftInput) -> Result<String, &'static str> {
    blank_template(&input.kind)?;
    if [&input.name, &input.contact, &input.company, &input.facts]
        .iter()
        .any(|s| s.trim().is_empty())
    {
        return Err("성명, 회신 연락처, 사업자명, 확인된 사실을 입력하세요.");
    }
    if [
        &input.name,
        &input.contact,
        &input.company,
        &input.facts,
        &input.requested_remedy,
        &input.evidence,
    ]
    .iter()
    .any(|s| s.len() > 20_000 || s.contains('\0'))
    {
        return Err("입력이 너무 길거나 지원하지 않는 문자가 있습니다.");
    }
    if input.amount_krw.is_some() && !matches!(input.loss_status, LossStatus::Confirmed) {
        return Err("실제 손해가 확인된 경우에만 손해 금액을 입력하세요.");
    }
    let loss = match input.loss_status {
        LossStatus::Unknown => "구체적인 피해 발생 여부는 아직 확인되지 않았습니다.".to_string(),
        LossStatus::NoConfirmedLoss => {
            "현재 확인된 쿠폰 무단 사용 또는 금전 손실은 없습니다.".to_string()
        }
        LossStatus::Confirmed => match input.amount_krw {
            Some(n) => format!(
                "신청인이 확인한 손해 금액: {n}원. 인과관계와 배상 인정 여부는 별도 확인이 필요합니다."
            ),
            None => "신청인이 실제 손해를 확인했으며 금액은 아직 확정하지 않았습니다.".to_string(),
        },
    };
    let purpose = match input.kind.as_str() {
        "inquiry" => "개인정보 유출 여부 및 보호 조치 확인 요청",
        "compensation" => "개인정보 유출 관련 보상 검토 요청",
        _ => "개인정보 분쟁조정 신청 초안 (공식 신청서 아님)",
    };
    Ok(format!(
        "{purpose}\n\n대상 사업자: {}\n신청인: {}\n회신 연락처: {}\n\n확인된 사실과 경과\n{}\n\n피해 확인 상태\n{loss}\n\n본인이 선택한 요청 사항\n{}\n\n증빙 또는 추가 확인 사항\n{}\n\n본 문서는 신청 준비용입니다. 자동 제출되지 않습니다. 본인은 확인된 사실을 검토한 후 공식 접수 경로에서 직접 제출합니다. 이 요청은 추가 피해에 관한 권리를 포기하는 취지가 아닙니다.\n",
        input.company.trim(),
        input.name.trim(),
        input.contact.trim(),
        input.facts.trim(),
        input.requested_remedy.trim(),
        input.evidence.trim()
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn guidance_resolves_all_routes_sources_and_incidents() {
        let data = guidance_data();
        let source_ids: std::collections::BTreeSet<&str> = data["sources"]
            .as_array()
            .unwrap()
            .iter()
            .map(|s| {
                assert!(s["url"].as_str().unwrap().starts_with("https://"));
                assert_eq!(s["checked_on"], data["as_of"]);
                s["id"].as_str().unwrap()
            })
            .collect();
        let route_ids: std::collections::BTreeSet<&str> = data["routes"]
            .as_array()
            .unwrap()
            .iter()
            .map(|r| r["id"].as_str().unwrap())
            .collect();
        for route in data["routes"].as_array().unwrap() {
            assert!(!route["cost"].as_str().unwrap().is_empty());
            for id in route["source_ids"].as_array().unwrap() {
                assert!(source_ids.contains(id.as_str().unwrap()));
            }
        }
        for scenario in data["scenarios"].as_array().unwrap() {
            assert!(blank_template(scenario["template_kind"].as_str().unwrap()).is_ok());
            for action in scenario["actions"].as_array().unwrap() {
                for id in action["route_ids"].as_array().unwrap() {
                    assert!(route_ids.contains(id.as_str().unwrap()));
                }
                for id in action["source_ids"].as_array().unwrap() {
                    assert!(source_ids.contains(id.as_str().unwrap()));
                }
            }
            for incident in ["generic", "skplanet_gifticon_2026_10"] {
                let plan = response_plan(scenario["id"].as_str().unwrap(), incident).unwrap();
                assert!(!plan["sources"].as_array().unwrap().is_empty());
                assert!(!plan["routes"].as_array().unwrap().is_empty());
                if incident != "generic" {
                    assert_eq!(plan["incident_context"]["id"], incident);
                }
            }
        }
        assert!(response_plan("unknown", "generic").is_err());
        assert!(response_plan("notice_only", "unknown").is_err());
    }
    #[test]
    fn urgent_fraud_is_distinct_from_notice_only() {
        let fraud = response_plan("financial_fraud", "generic").unwrap();
        let notice = response_plan("notice_only", "generic").unwrap();
        assert_eq!(fraud["scenario"]["urgency"], "urgent");
        assert_eq!(notice["scenario"]["urgency"], "normal");
        assert!(
            fraud["scenario"]["actions"][0]["route_ids"]
                .as_array()
                .unwrap()
                .contains(&json!("police"))
        );
        assert_eq!(notice["scenario"]["template_kind"], "inquiry");
        assert!(fraud["incident_context"].is_null());
    }
    fn input() -> DraftInput {
        DraftInput {
            kind: "compensation".into(),
            name: "가상 신청인".into(),
            contact: "example@example.invalid".into(),
            company: "가상 사업자".into(),
            facts: "안내문 수신".into(),
            loss_status: LossStatus::Unknown,
            amount_krw: None,
            requested_remedy: "유출 여부 확인".into(),
            evidence: "".into(),
        }
    }
    #[test]
    fn unknown_loss_cannot_claim_amount() {
        let mut i = input();
        i.amount_krw = Some(100);
        assert!(render_draft(&i).is_err());
    }
    #[test]
    fn draft_does_not_invent_loss_or_submission() {
        let text = render_draft(&input()).unwrap();
        assert!(text.contains("아직 확인되지"));
        assert!(text.contains("자동 제출되지"));
        assert!(!text.contains("300만원"));
    }
    #[test]
    fn confirmed_loss_uses_only_supplied_amount() {
        let mut i = input();
        i.loss_status = LossStatus::Confirmed;
        i.amount_krw = Some(1234);
        assert!(render_draft(&i).unwrap().contains("1234원"));
    }
    #[test]
    fn rejects_unknown_kind_and_extra_fields() {
        assert!(blank_template("send_email").is_err());
        let mut v = serde_json::to_value(input()).unwrap();
        v["secret"] = json!("unexpected");
        assert!(serde_json::from_value::<DraftInput>(v).is_err());
    }
}
