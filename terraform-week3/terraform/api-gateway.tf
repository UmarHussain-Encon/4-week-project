# ======================================================
# HTTP API
# ======================================================

resource "aws_apigatewayv2_api" "coldchain" {

  name =
    var.api_name


  protocol_type =
    "HTTP"
}


# ======================================================
# LAMBDA INTEGRATION
# ======================================================

resource "aws_apigatewayv2_integration" "link_dynamodb" {

  api_id =
    aws_apigatewayv2_api
      .coldchain
      .id


  integration_type =
    "AWS_PROXY"


  integration_method =
    "POST"


  integration_uri =
    aws_lambda_function
      .link_dynamodb
      .invoke_arn


  payload_format_version =
    "2.0"
}


# ======================================================
# GET ALL READINGS
# ======================================================

resource "aws_apigatewayv2_route" "get_readings" {

  api_id =
    aws_apigatewayv2_api
      .coldchain
      .id


  route_key =
    "GET /branches/{branchId}/readings"


  target =
    "integrations/${aws_apigatewayv2_integration.link_dynamodb.id}"
}


# ======================================================
# POST READING
# ======================================================

resource "aws_apigatewayv2_route" "post_reading" {

  api_id =
    aws_apigatewayv2_api
      .coldchain
      .id


  route_key =
    "POST /branches/{branchId}/readings"


  target =
    "integrations/${aws_apigatewayv2_integration.link_dynamodb.id}"
}


# ======================================================
# GET ONE READING
# ======================================================

resource "aws_apigatewayv2_route" "get_one_reading" {

  api_id =
    aws_apigatewayv2_api
      .coldchain
      .id


  route_key =
    "GET /branches/{branchId}/readings/{recordedAt}"


  target =
    "integrations/${aws_apigatewayv2_integration.link_dynamodb.id}"
}


# ======================================================
# DEFAULT STAGE
# ======================================================

resource "aws_apigatewayv2_stage" "default" {

  api_id =
    aws_apigatewayv2_api
      .coldchain
      .id


  name =
    "$default"


  auto_deploy =
    true
}


# ======================================================
# ALLOW API GATEWAY TO CALL LAMBDA
# ======================================================

resource "aws_lambda_permission" "allow_api_gateway" {

  statement_id =
    "AllowAPIGatewayInvoke"


  action =
    "lambda:InvokeFunction"


  function_name =
    aws_lambda_function
      .link_dynamodb
      .function_name


  principal =
    "apigateway.amazonaws.com"


  source_arn =
    "${aws_apigatewayv2_api.coldchain.execution_arn}/*/*"
}