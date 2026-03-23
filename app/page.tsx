"use client";

import { useState, useRef, ChangeEvent, DragEvent, MouseEvent } from "react";
import { UploadCloud, Download, Loader2, X, RefreshCcw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// --- Mock Data & Types ---
const dummyData = [
  { id: 1, tanggalWaktu: "31 Maret 2026 13:15", mataKuliah: "Mekanika Fluida", kode: "VTE2624208", sks: "2", ruang: "E 2.3 SV TBL" },
  { id: 2, tanggalWaktu: "01 April 2026 08:00", mataKuliah: "Matematika Teknik", kode: "VTE2624201", sks: "3", ruang: "B 1.1 SV" },
  { id: 3, tanggalWaktu: "02 April 2026 10:00", mataKuliah: "Elektronika Digital", kode: "VTE2624205", sks: "2", ruang: "E 2.4 SV TBL" },
];

type ScheduleData = typeof dummyData;

// --- Components ---
function Header() {
  return (
    <header className="text-center space-y-4 mt-6 md:mt-12 mb-8 md:mb-12 shrink-0">
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
        dipSchedule
      </h1>
      <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
        Konverter cerdas untuk Dips: Ubah PDF jadwal UTS dan UAS menjadi tabel rapi dan terurut dalam hitungan detik.
      </p>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-auto pt-4 md:pt-6 border-t text-center text-sm text-muted-foreground shrink-0">
      &copy; {new Date().getFullYear()}{" "}
      <a
        href="https://github.com/ReintB/dipSchedule"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium underline underline-offset-4 hover:text-foreground transition-colors"
      >
        dipSchedule
      </a>.
    </footer>
  );
}

function UploadCard({
  file,
  setFile,
  loading,
  onProcess,
}: {
  file: File | null;
  setFile: (file: File | null) => void;
  loading: boolean;
  onProcess: () => void;
}) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast.error("Format file tidak didukung", { description: "Harap unggah file PDF." });
      setFile(null);
    } else {
      toast.success("File ditambahkan", { description: selectedFile.name });
      setFile(selectedFile);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = (e: MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    toast.info("File jadwal dihapus");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-sm shrink-0">
      <CardHeader className="text-center">
        <CardTitle>Upload Jadwal</CardTitle>
        <CardDescription>Pilih file PDF jadwal ujian Anda untuk dikonversi.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 ${
            isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25 bg-muted/50 hover:bg-muted"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="w-10 h-10 text-muted-foreground mb-4" />
          <p className="text-sm font-medium mb-1">Drag and drop your file here, or click to select</p>
          <p className="text-xs text-muted-foreground">Hanya mendukung format .pdf</p>
          <Input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
        </div>
        {file && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 py-2 px-4 rounded-md w-fit mx-auto max-w-full">
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate font-medium text-foreground">{file.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-destructive/20 hover:text-destructive shrink-0"
              onClick={handleRemoveFile}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        <Button
          className="w-full"
          onClick={onProcess}
          disabled={loading || !file}
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {loading ? "Memproses..." : "Proses Jadwal"}
        </Button>
      </CardContent>
    </Card>
  );
}

function ResultTable({ data, onReset }: { data: ScheduleData; onReset: () => void }) {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 mt-8 md:mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
          Hasil Konversi Jadwal
        </h2>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" /> CSV
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" /> XLSX
          </Button>
          <Button variant="ghost" onClick={onReset} className="w-full sm:w-auto text-muted-foreground hover:text-foreground">
            <RefreshCcw className="w-4 h-4 mr-2" /> Reset
          </Button>
        </div>
      </div>

      <div className="border rounded-md bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu Ujian</TableHead>
              <TableHead>Mata Kuliah</TableHead>
              <TableHead>Kode</TableHead>
              <TableHead>SKS</TableHead>
              <TableHead>Ruang</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.tanggalWaktu}</TableCell>
                <TableCell>{row.mataKuliah}</TableCell>
                <TableCell>{row.kode}</TableCell>
                <TableCell>{row.sks}</TableCell>
                <TableCell>{row.ruang}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<ScheduleData | null>(null);

  const handleProcess = () => {
    if (!file) return;

    setLoading(true);
    toast.loading("Mengekstrak jadwal...", { id: "process-toast" });

    // Simulasi parsing PDF
    setTimeout(() => {
      setData(dummyData);
      setLoading(false);
      toast.success("Jadwal berhasil dikonversi!", { id: "process-toast" });
    }, 1500);
  };

  const handleReset = () => {
    setFile(null);
    setData(null);
    toast.info("Aplikasi telah di-reset");
  };

  return (
    <div className="flex flex-col min-h-screen w-full max-w-5xl mx-auto px-4 py-8 md:py-10">
      <Header />

      <main className="flex-1 flex flex-col mb-8 md:mb-12">
        <UploadCard 
          file={file} 
          setFile={setFile} 
          loading={loading} 
          onProcess={handleProcess} 
        />

        {data && (
          <ResultTable data={data} onReset={handleReset} />
        )}
      </main>

      <Footer />
    </div>
  );
}