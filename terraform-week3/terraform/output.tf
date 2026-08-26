output "api_base_url" {

  description =
    "Base URL of the cold-chain HTTP API"


  value =
    aws_apigatewayv2_api
      .coldchain
      .api_endpoint
}


output "postman_readings_url" {

  description =
    "Example URL for BRANCH-001 readings"


  value =
    "${aws_apigatewayv2_api.coldchain.api_endpoint}/branches/BRANCH-001/readings"
}


output "dynamodb_table_name" {

  value =
    aws_dynamodb_table
      .readings
      .name
}


output "link_dynamodb_lambda_name" {

  value =
    aws_lambda_function
      .link_dynamodb
      .function_name
}


output "excursion_handler_lambda_name" {

  value =
    aws_lambda_function
      .excursion_handler
      .function_name
}


output "sns_topic_arn" {

  value =
    aws_sns_topic
      .excursions
      .arn
}


output "sqs_queue_url" {

  value =
    aws_sqs_queue
      .alert_queue
      .url
}


output "sqs_dlq_url" {

  value =
    aws_sqs_queue
      .alert_dlq
      .url
}