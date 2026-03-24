"use client";

import { useState, useRef, ChangeEvent, DragEvent, MouseEvent } from "react";
import { UploadCloud, Download, Loader2, X, RefreshCcw, FileText, CalendarDays } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import Papa from "papaparse";
import * as XLSX from "xlsx";

type ScheduleItem = {
  id?: number;
  tanggalWaktu: string;
  mataKuliah: string;
  kode: string;
  sks: string;
  ruang: string;
  timestamp?: number;
};
type ScheduleData = ScheduleItem[];

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

function TableSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 mt-8 md:mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <Skeleton className="h-10 w-20 sm:w-24" />
          <Skeleton className="h-10 w-20 sm:w-24" />
          <Skeleton className="h-10 w-20 sm:w-24" />
        </div>
      </div>
      <div className="border rounded-md bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-4 w-24" /></TableHead>
              <TableHead><Skeleton className="h-4 w-32" /></TableHead>
              <TableHead><Skeleton className="h-4 w-16" /></TableHead>
              <TableHead><Skeleton className="h-4 w-12" /></TableHead>
              <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-30 lg:w-37.5" /></TableCell>
                <TableCell><Skeleton className="h-4 w-45 lg:w-50" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                <TableCell><Skeleton className="h-4 w-25" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ResultTable({ data, onReset }: { data: ScheduleData; onReset: () => void }) {
  const getExportData = () => data.map(({ tanggalWaktu, mataKuliah, kode, sks, ruang }) => ({
    "Waktu Ujian": tanggalWaktu,
    "Mata Kuliah": mataKuliah,
    "Kode": kode,
    "SKS": sks,
    "Ruang": ruang
  }));

  const handleDownloadCSV = () => {
    const csv = Papa.unparse(getExportData());
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'jadwal-ujian.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File CSV berhasil diunduh");
  };

  const handleDownloadXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(getExportData());
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jadwal Terurut");
    XLSX.writeFile(workbook, "jadwal-ujian.xlsx");
    toast.success("File Excel berhasil diunduh");
  };

  const handleDownloadICS = () => {
    if (!data.length) return;

    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//dipSchedule//ID",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ].join("\n") + "\n";

    data.forEach((event, index) => {
      const startDate = event.timestamp ? new Date(event.timestamp) : new Date();
      
      let endDate = new Date(startDate.getTime() + 100 * 60000);
      const timeMatch = event.tanggalWaktu.match(/-\s*(\d{1,2})[:.](\d{2})/);
      
      if (timeMatch) {
         endDate = new Date(startDate);
         endDate.setHours(parseInt(timeMatch[1], 10));
         endDate.setMinutes(parseInt(timeMatch[2], 10));
         endDate.setSeconds(0);
         
         if (endDate < startDate) {
            endDate = new Date(endDate.getTime() + 24 * 3600000);
         }
      }

      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      };

      icsContent += [
        "BEGIN:VEVENT",
        `UID:dipschedule-${index}-${Date.now()}@domain.com`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:Ujian ${event.mataKuliah}`,
        `DESCRIPTION:SKS: ${event.sks}\\nKode: ${event.kode}\\nWaktu: ${event.tanggalWaktu}`,
        `LOCATION:${event.ruang}`,
        "STATUS:CONFIRMED",
        "END:VEVENT"
      ].join("\n") + "\n";
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "jadwal-ujian.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File iCal (Google Calendar) berhasil diunduh");
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 mt-8 md:mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
          Hasil Konversi Jadwal
        </h2>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={handleDownloadCSV}>
            <Download className="w-4 h-4 mr-2" /> CSV
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={handleDownloadXLSX}>
            <Download className="w-4 h-4 mr-2" /> XLSX
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={handleDownloadICS}>
            <CalendarDays className="w-4 h-4 mr-2" /> ICS
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
            {data.map((row, i) => (
              <TableRow key={row.id || i}>
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

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<ScheduleData | null>(null);

  const handleProcess = async () => {
    if (!file) return;

    setLoading(true);
    toast.loading("Mengekstrak jadwal...", { id: "process-toast" });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = null;
        }
        const errorMessage = errorData?.error || "Gagal mengekstrak PDF. Pastikan file valid.";
        toast.error("Gagal memproses file", { 
          id: "process-toast",
          description: errorMessage,
        });
        setLoading(false);
        return;
      }

      const rawData: ScheduleData = await response.json();
      const sortedSchedules = rawData.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

      setData(sortedSchedules);
      toast.success("Jadwal berhasil dikonversi!", { id: "process-toast" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.";
      toast.error("Gagal memproses file", { 
        id: "process-toast",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
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

        {loading && <TableSkeleton />}

        {!loading && data && (
          <ResultTable data={data} onReset={handleReset} />
        )}
      </main>

      <Footer />
    </div>
  );
}