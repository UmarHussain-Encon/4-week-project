# ======================================================
# ORIGINAL TERRAFORM TABLE
#
# We keep this table because we are not deleting
# existing project resources.
# ======================================================

resource "aws_dynamodb_table" "readings" {
  name         = var.dynamodb_table_name
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "branchId"
  range_key = "readingKey"

  attribute {
    name = "branchId"
    type = "S"
  }

  attribute {
    name = "readingKey"
    type = "S"
  }
}


# ======================================================
# NEW READING-ID BASED TABLE
# ======================================================

resource "aws_dynamodb_table" "readings_by_id" {
  name         = var.dynamodb_readings_table_name
  billing_mode = "PAY_PER_REQUEST"

  # readingId is now the unique primary key
  hash_key = "readingId"


  attribute {
    name = "readingId"
    type = "S"
  }


  attribute {
    name = "branchId"
    type = "S"
  }


  attribute {
    name = "recordedAt"
    type = "S"
  }


  # Allows:
  #
  # GET all readings for a branch
  # newest first
  # from/to date queries
  #
  # Multiple readings may have the same recordedAt.

  global_secondary_index {
    name            = var.readings_gsi_name
    hash_key        = "branchId"
    range_key       = "recordedAt"
    projection_type = "ALL"
  }
}