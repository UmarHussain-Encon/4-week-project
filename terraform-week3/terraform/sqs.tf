# ======================================================
# DEAD LETTER QUEUE
# ======================================================

resource "aws_sqs_queue" "alert_dlq" {

  name =
    var.sqs_dlq_name


  message_retention_seconds =
    1209600
}


# ======================================================
# MAIN ALERT QUEUE
# ======================================================

resource "aws_sqs_queue" "alert_queue" {

  name =
    var.sqs_queue_name


  visibility_timeout_seconds =
    var.sqs_visibility_timeout


  message_retention_seconds =
    345600


  redrive_policy =
    jsonencode({

      deadLetterTargetArn =
        aws_sqs_queue.alert_dlq.arn

      maxReceiveCount =
        var.sqs_max_receive_count
    })
}


# ======================================================
# CONTROL WHICH QUEUE MAY USE THE DLQ
# ======================================================

resource "aws_sqs_queue_redrive_allow_policy" "alert_dlq" {

  queue_url =
    aws_sqs_queue.alert_dlq.id


  redrive_allow_policy =
    jsonencode({

      redrivePermission =
        "byQueue"

      sourceQueueArns = [

        aws_sqs_queue.alert_queue.arn
      ]
    })
}


# ======================================================
# ALLOW SNS TO SEND TO SQS
# ======================================================

data "aws_iam_policy_document" "allow_sns_to_sqs" {

  statement {

    sid =
      "AllowSNSPublish"


    effect =
      "Allow"


    principals {

      type =
        "Service"

      identifiers = [
        "sns.amazonaws.com"
      ]
    }


    actions = [

      "sqs:SendMessage"
    ]


    resources = [

      aws_sqs_queue.alert_queue.arn
    ]


    condition {

      test =
        "ArnEquals"

      variable =
        "aws:SourceArn"

      values = [

        aws_sns_topic.excursions.arn
      ]
    }
  }
}


resource "aws_sqs_queue_policy" "allow_sns" {

  queue_url =
    aws_sqs_queue.alert_queue.id


  policy =
    data.aws_iam_policy_document
      .allow_sns_to_sqs
      .json
}


# ======================================================
# SQS -> EXCURSION LAMBDA
# ======================================================

resource "aws_lambda_event_source_mapping" "alert_queue_to_handler" {

  event_source_arn =
    aws_sqs_queue.alert_queue.arn


  function_name =
    aws_lambda_function
      .excursion_handler
      .arn


  batch_size =
    1


  enabled =
    true


  depends_on = [

    aws_iam_role_policy
      .excursion_handler_access
  ]
}