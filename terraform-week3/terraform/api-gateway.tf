# ======================================================
# REST API GATEWAY (V1)
# ======================================================

resource "aws_api_gateway_rest_api" "coldchain" {
  name           = var.api_name
  description    = "Terraform cold-chain REST API"
  api_key_source = "HEADER"
}


# ======================================================
# TELL TERRAFORM THAT THE OLD TIMESTAMP RESOURCE
# HAS BEEN RENAMED TO READING ID
# ======================================================

moved {
  from = aws_api_gateway_resource.reading_by_timestamp
  to   = aws_api_gateway_resource.reading_by_id
}


# ======================================================
# /branches
# ======================================================

resource "aws_api_gateway_resource" "branches" {
  rest_api_id = aws_api_gateway_rest_api.coldchain.id
  parent_id   = aws_api_gateway_rest_api.coldchain.root_resource_id
  path_part   = "branches"
}


# ======================================================
# /branches/{branchId}
# ======================================================

resource "aws_api_gateway_resource" "branch" {
  rest_api_id = aws_api_gateway_rest_api.coldchain.id
  parent_id   = aws_api_gateway_resource.branches.id
  path_part   = "{branchId}"
}


# ======================================================
# /branches/{branchId}/readings
# ======================================================

resource "aws_api_gateway_resource" "readings" {
  rest_api_id = aws_api_gateway_rest_api.coldchain.id
  parent_id   = aws_api_gateway_resource.branch.id
  path_part   = "readings"
}


# ======================================================
# /branches/{branchId}/readings/{readingId}
# ======================================================

resource "aws_api_gateway_resource" "reading_by_id" {
  rest_api_id = aws_api_gateway_rest_api.coldchain.id
  parent_id   = aws_api_gateway_resource.readings.id
  path_part   = "{readingId}"
}


# ======================================================
# GET ALL READINGS
# GET /branches/{branchId}/readings
# ======================================================

resource "aws_api_gateway_method" "get_readings" {
  rest_api_id      = aws_api_gateway_rest_api.coldchain.id
  resource_id      = aws_api_gateway_resource.readings.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "get_readings" {
  rest_api_id = aws_api_gateway_rest_api.coldchain.id
  resource_id = aws_api_gateway_resource.readings.id
  http_method = aws_api_gateway_method.get_readings.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.link_dynamodb.invoke_arn
}


# ======================================================
# POST NEW READING
# POST /branches/{branchId}/readings
# ======================================================

resource "aws_api_gateway_method" "post_reading" {
  rest_api_id      = aws_api_gateway_rest_api.coldchain.id
  resource_id      = aws_api_gateway_resource.readings.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "post_reading" {
  rest_api_id = aws_api_gateway_rest_api.coldchain.id
  resource_id = aws_api_gateway_resource.readings.id
  http_method = aws_api_gateway_method.post_reading.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.link_dynamodb.invoke_arn
}


# ======================================================
# GET ONE READING
# GET /branches/{branchId}/readings/{readingId}
# ======================================================

resource "aws_api_gateway_method" "get_one_reading" {
  rest_api_id      = aws_api_gateway_rest_api.coldchain.id
  resource_id      = aws_api_gateway_resource.reading_by_id.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "get_one_reading" {
  rest_api_id = aws_api_gateway_rest_api.coldchain.id
  resource_id = aws_api_gateway_resource.reading_by_id.id
  http_method = aws_api_gateway_method.get_one_reading.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.link_dynamodb.invoke_arn
}


# ======================================================
# PATCH READING
# PATCH /branches/{branchId}/readings/{readingId}
# ======================================================

resource "aws_api_gateway_method" "patch_reading" {
  rest_api_id      = aws_api_gateway_rest_api.coldchain.id
  resource_id      = aws_api_gateway_resource.reading_by_id.id
  http_method      = "PATCH"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "patch_reading" {
  rest_api_id = aws_api_gateway_rest_api.coldchain.id
  resource_id = aws_api_gateway_resource.reading_by_id.id
  http_method = aws_api_gateway_method.patch_reading.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.link_dynamodb.invoke_arn
}


# ======================================================
# DELETE READING
# DELETE /branches/{branchId}/readings/{readingId}
# ======================================================

resource "aws_api_gateway_method" "delete_reading" {
  rest_api_id      = aws_api_gateway_rest_api.coldchain.id
  resource_id      = aws_api_gateway_resource.reading_by_id.id
  http_method      = "DELETE"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "delete_reading" {
  rest_api_id = aws_api_gateway_rest_api.coldchain.id
  resource_id = aws_api_gateway_resource.reading_by_id.id
  http_method = aws_api_gateway_method.delete_reading.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.link_dynamodb.invoke_arn
}


# ======================================================
# API DEPLOYMENT
# ======================================================

resource "aws_api_gateway_deployment" "coldchain" {
  rest_api_id = aws_api_gateway_rest_api.coldchain.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.branches.id,
      aws_api_gateway_resource.branch.id,
      aws_api_gateway_resource.readings.id,
      aws_api_gateway_resource.reading_by_id.id,

      aws_api_gateway_method.get_readings.id,
      aws_api_gateway_method.post_reading.id,
      aws_api_gateway_method.get_one_reading.id,
      aws_api_gateway_method.patch_reading.id,
      aws_api_gateway_method.delete_reading.id,

      aws_api_gateway_method.get_readings.api_key_required,
      aws_api_gateway_method.post_reading.api_key_required,
      aws_api_gateway_method.get_one_reading.api_key_required,
      aws_api_gateway_method.patch_reading.api_key_required,
      aws_api_gateway_method.delete_reading.api_key_required,

      aws_api_gateway_integration.get_readings.id,
      aws_api_gateway_integration.post_reading.id,
      aws_api_gateway_integration.get_one_reading.id,
      aws_api_gateway_integration.patch_reading.id,
      aws_api_gateway_integration.delete_reading.id
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.get_readings,
    aws_api_gateway_integration.post_reading,
    aws_api_gateway_integration.get_one_reading,
    aws_api_gateway_integration.patch_reading,
    aws_api_gateway_integration.delete_reading
  ]
}


# ======================================================
# DEV STAGE
# ======================================================

resource "aws_api_gateway_stage" "dev" {
  deployment_id = aws_api_gateway_deployment.coldchain.id
  rest_api_id   = aws_api_gateway_rest_api.coldchain.id
  stage_name    = var.api_stage_name
}


# ======================================================
# ALLOW API GATEWAY TO INVOKE LAMBDA
# ======================================================

resource "aws_lambda_permission" "allow_api_gateway" {
  statement_id  = "AllowRESTAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.link_dynamodb.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.coldchain.execution_arn}/*/*"
}