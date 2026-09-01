# ======================================================
# API KEY
# ======================================================

resource "aws_api_gateway_api_key" "coldchain" {
  name        = "umar-coldchain-api-key-terraform"
  description = "API key for the Terraform cold-chain REST API"
  enabled     = true
}


# ======================================================
# USAGE PLAN
# ======================================================

resource "aws_api_gateway_usage_plan" "coldchain" {
  name        = "umar-coldchain-usage-plan-terraform"
  description = "Usage plan for the Terraform cold-chain REST API"

  api_stages {
    api_id = aws_api_gateway_rest_api.coldchain.id
    stage  = aws_api_gateway_stage.dev.stage_name
  }
}


# ======================================================
# CONNECT API KEY TO USAGE PLAN
# ======================================================

resource "aws_api_gateway_usage_plan_key" "coldchain" {
  key_id        = aws_api_gateway_api_key.coldchain.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.coldchain.id
}