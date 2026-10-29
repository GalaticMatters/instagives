"use client";

import type { ReactElement } from "react";
import { BarcodeTool } from "@/components/tools/barcode-tool";
import { CalculatorTool } from "@/components/tools/calculator-tool";
import { ClipboardTool } from "@/components/tools/clipboard-tool";
import { BmiTool, CaloriesTool, PregnancyTool } from "@/components/tools/health-tools";
import { FileCompressionTool, FileConversionTool, ImageResizeTool } from "@/components/tools/media-tools";
import { EmiTool, LoanTool, MortgageTool } from "@/components/tools/money-tools";
import { QrCodeTool } from "@/components/tools/qr-code-tool";
import { JetLagTool, PackingTool } from "@/components/tools/travel-tools";
import { UnitConverterTool } from "@/components/tools/unit-converter-tool";
import { WhiteNoiseTool } from "@/components/tools/white-noise-tool";

const apps: Record<string, () => ReactElement> = {
  "online-clipboard": () => <ClipboardTool />,
  "qr-code": () => <QrCodeTool />,
  barcode: () => <BarcodeTool />,
  calculator: () => <CalculatorTool />,
  "file-conversion": () => <FileConversionTool />,
  "file-compression": () => <FileCompressionTool />,
  "unit-converter": () => <UnitConverterTool />,
  "white-noise": () => <WhiteNoiseTool />,
  "image-resize": () => <ImageResizeTool />,
  "loan-calculator": () => <LoanTool />,
  "emi-calculator": () => <EmiTool />,
  "mortgage-calculator": () => <MortgageTool />,
  "bmi-calculator": () => <BmiTool />,
  "calories-calculator": () => <CaloriesTool />,
  "pregnancy-calculator": () => <PregnancyTool />,
  "packing-list": () => <PackingTool />,
  "jet-lag-calculator": () => <JetLagTool />,
};

export function RenderTool({ slug }: { slug: string }) {
  const render = apps[slug];
  if (!render) return null;
  return render();
}
