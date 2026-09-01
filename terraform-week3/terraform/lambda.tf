# ======================================================
# PACKAGE LINK-DYNAMODB LAMBDA
# ======================================================

data "archive_file" "link_dynamodb_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/link-dynamodb"
  output_path = "${path.module}/link-dynamodb.zip"
}


# ======================================================
# PACKAGE EXCURSION-HANDLER LAMBDA
# ======================================================

data "archive_file" "excursion_handler_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/excursion-handler"
  output_path = "${path.module}/excursion-handler.zip"
}


# ======================================================
# CLOUDWATCH LOG GROUPS
# ======================================================

resource "aws_cloudwatch_log_group" "link_dynamodb" {
  name              = "/aws/lambda/${var.link_dynamodb_lambda_name}"
  retention_in_days = var.cloudwatch_retention_days
}


resource "aws_cloudwatch_log_group" "excursion_handler" {
  name              = "/aws/lambda/${var.excursion_handler_lambda_name}"
  retention_in_days = var.cloudwatch_retention_days
}


# ======================================================
# MAIN LINK-DYNAMODB LAMBDA
# ======================================================

resource "aws_lambda_function" "link_dynamodb" {
  function_name = var.link_dynamodb_lambda_name

  filename         = data.archive_file.link_dynamodb_zip.output_path
  source_code_hash = data.archive_file.link_dynamodb_zip.output_base64sha256

  role    = aws_iam_role.link_dynamodb.arn
  runtime = var.lambda_runtime
  handler = "index.handler"

  timeout     = var.main_lambda_timeout
  memory_size = 128

  environment {
    variables = {
      TABLE_NAME               = aws_dynamodb_table.readings_by_id.name
      BRANCH_RECORDED_AT_INDEX = var.readings_gsi_name
      EXCURSION_TOPIC_ARN      = aws_sns_topic.excursions.arn
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.link_dynamodb_logs,
    aws_iam_role_policy.link_dynamodb_access,
    aws_cloudwatch_log_group.link_dynamodb
  ]
}


# ======================================================
# EXCURSION-HANDLER LAMBDA
# ======================================================

resource "aws_lambda_function" "excursion_handler" {
  function_name = var.excursion_handler_lambda_name

  filename         = data.archive_file.excursion_handler_zip.output_path
  source_code_hash = data.archive_file.excursion_handler_zip.output_base64sha256

  role    = aws_iam_role.excursion_handler.arn
  runtime = var.lambda_runtime
  handler = "index.handler"

  timeout     = var.excursion_lambda_timeout
  memory_size = 128

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.readings_by_id.name
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.excursion_handler_logs,
    aws_iam_role_policy.excursion_handler_access,
    aws_cloudwatch_log_group.excursion_handler
  ]
}