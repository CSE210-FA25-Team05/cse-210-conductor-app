// tracing.js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-http');
const {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} = require('@opentelemetry/sdk-trace-base');

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces',
  }),
  spanProcessor: new SimpleSpanProcessor(new ConsoleSpanExporter()), // logs traces to console
  instrumentations: [getNodeAutoInstrumentations()],
});

try {
  sdk.start();
  console.log('✅ OpenTelemetry SDK started');
} catch (err) {
  console.error('❌ OpenTelemetry failed to start', err);
}
