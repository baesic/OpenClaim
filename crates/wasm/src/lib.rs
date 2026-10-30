use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn public_catalog() -> String {
    openclaim_core::catalog().to_string()
}

#[wasm_bindgen]
pub fn public_guidance_index() -> String {
    openclaim_core::guidance_index().to_string()
}

#[wasm_bindgen]
pub fn public_response_plan(scenario: &str, incident: &str) -> Result<String, JsValue> {
    openclaim_core::response_plan(scenario, incident)
        .map(|v| v.to_string())
        .map_err(JsValue::from_str)
}

#[wasm_bindgen]
pub fn public_template(kind: &str) -> Result<String, JsValue> {
    openclaim_core::blank_template(kind)
        .map(str::to_owned)
        .map_err(JsValue::from_str)
}

#[wasm_bindgen]
pub fn local_draft(json: &str) -> Result<String, JsValue> {
    let input = serde_json::from_str::<openclaim_core::DraftInput>(json)
        .map_err(|_| JsValue::from_str("작성 항목 형식을 확인하세요."))?;
    openclaim_core::render_draft(&input).map_err(JsValue::from_str)
}
