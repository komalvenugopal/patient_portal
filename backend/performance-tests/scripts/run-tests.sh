#!/bin/bash

# Set JVM options
export JVM_ARGS="-Xms512m -Xmx512m -XX:MaxMetaspaceSize=256m"

JMETER_HOME="/opt/homebrew"
TEST_PLAN="../test-plans/simple-test-plan.jmx"
RESULTS_DIR="../results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$RESULTS_DIR/reports_$TIMESTAMP"

"$JMETER_HOME/bin/jmeter" \
    -n \
    -t "$TEST_PLAN" \
    -l "$RESULTS_DIR/reports_$TIMESTAMP/results.csv" \
    -e -o "$RESULTS_DIR/reports_$TIMESTAMP/dashboard" \
    -Jjmeter.save.saveservice.output_format=csv \
    -Jjmeter.save.saveservice.timestamp_format="yyyy-MM-dd HH:mm:ss" \
    -Jjmeter.save.saveservice.print_field_names=true \
    -Jhttpsampler.max_pool_size=1 \
    -Jhttpsampler.connection_timeout=5000 \
    -Jhttpsampler.response_timeout=10000