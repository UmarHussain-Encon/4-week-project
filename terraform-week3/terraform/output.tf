output "api_base_url" {
  description = "Base URL of the Terraform REST API"

  value = "https://${aws_api_gateway_rest_api.coldchain.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.dev.stage_name}"
}

output "postman_readings_url" {
  description = "POST and GET readings URL for BRANCH-001"

  value = "https://${aws_api_gateway_rest_api.coldchain.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.dev.stage_name}/branches/BRANCH-001/readings"
}

output "dynamodb_table_name" {
  description = "Active readingId-based DynamoDB table"
  value       = aws_dynamodb_table.readings_by_id.name
}


output "legacy_dynamodb_table_name" {
  description = "Previous Terraform DynamoDB table retained rather than deleted"
  value       = aws_dynamodb_table.readings.name
}

output "link_dynamodb_lambda_name" {
  description = "Main Terraform Lambda"
  value       = aws_lambda_function.link_dynamodb.function_name
}

output "link_dynamodb_role_name" {
  description = "Main Lambda IAM role"
  value       = aws_iam_role.link_dynamodb.name
}

output "excursion_handler_lambda_name" {
  description = "Excursion-handler Terraform Lambda"
  value       = aws_lambda_function.excursion_handler.function_name
}

output "excursion_handler_role_name" {
  description = "Excursion-handler IAM role"
  value       = aws_iam_role.excursion_handler.name
}

output "sns_topic_arn" {
  description = "Excursion SNS topic ARN"
  value       = aws_sns_topic.excursions.arn
}

output "sqs_queue_url" {
  description = "Main excursion SQS queue URL"
  value       = aws_sqs_queue.alert_queue.url
}

output "sqs_dlq_url" {
  description = "Excursion DLQ URL"
  value       = aws_sqs_queue.alert_dlq.url
}

output "api_key_id" {
  description = "ID of the Terraform-created API key"
  value       = aws_api_gateway_api_key.coldchain.id
}