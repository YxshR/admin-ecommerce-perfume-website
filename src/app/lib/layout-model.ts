import mongoose, { Model } from 'mongoose';

// Define the section schema interface
interface Section {
  id: string;
  type: 'product' | 'image' | 'video' | 'text' | 'banner' | 'gallery';
  content: any;
  position: number;
}

// Define the layout document interface
interface ILayout {
  pageId: string;
  pageName: string;
  pagePath: string;
  sections: Section[];
  updatedAt: Date;
}

// Define and export the Layout model to be reused across multiple files
let Layout: Model<ILayout>;

if (mongoose.models.Layout) {
  Layout = mongoose.models.Layout as Model<ILayout>;
} else {
  const LayoutSchema = new mongoose.Schema<ILayout>({
    pageId: { type: String, required: true },
    pageName: { type: String, required: true },
    pagePath: { type: String, required: true },
    sections: [
      {
        id: { type: String, required: true },
        type: { type: String, required: true, enum: ['product', 'image', 'video', 'text', 'banner', 'gallery'] },
        content: { type: mongoose.Schema.Types.Mixed, required: true },
        position: { type: Number, required: true }
      }
    ],
    updatedAt: { type: Date, default: Date.now }
  });
  
  LayoutSchema.index({ pageId: 1 }, { unique: true });
  Layout = mongoose.model<ILayout>('Layout', LayoutSchema);
}

export default Layout; 