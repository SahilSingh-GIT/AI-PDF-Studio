import mongoose from 'mongoose';

const DocumentIntelligenceSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DocumentSession',
      required: true,
      index: true,
    },
    versionId: {
      type: Number,
      required: true,
      default: 1,
    },
    // 1. Processing State Machine
    process: {
      state: {
        type: String,
        enum: ['UPLOADED', 'ANALYZING', 'READY', 'PROCESSING', 'EXPORTING'],
        default: 'UPLOADED',
      },
      subState: { type: String, default: null },
      progress: { type: Number, default: 0 },
    },
    // 2. Raw Objective Analysis
    analysis: {
      pages: { type: mongoose.Schema.Types.Mixed, default: [] },
    },
    // 3. Interpreted Intelligence
    intelligence: {
      capabilities: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    // 4. Asset References
    assets: {
      metadataId: { type: String, default: null },
      layoutId: { type: String, default: null },
      searchId: { type: String, default: null },
      embeddingsId: { type: String, default: null },
      aiId: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

DocumentIntelligenceSchema.index({ documentId: 1, sessionId: 1, versionId: 1 }, { unique: true });

const DocumentIntelligence = mongoose.model('DocumentIntelligence', DocumentIntelligenceSchema);

export default DocumentIntelligence;