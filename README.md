# Description
Creates a gcp subcriber for a given subscription and writes to Kafka after merging metadata (probe)  

# Usages

# Code convention
- File names, variables, function names all follow camel case
- Class names and their file names must have title case, other files should use camel case
- Test files have `-spec` as a suffix

# Notes
- Setting very low values maxExtension / maxMessages / ackDeadline doesn't seem to cause the gcp pub/sub library to throw any sort of errors. Looks modifyAckDeadline which extends the ackDeadline for a message maxExtension at a time handles all of this internally. 
- We should configure flowControl options so that Kafka interal queue doesn't get full (keep in mind one gcp message can have >100 messages to Kafka)
