import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const languages = [
  { name: "JavaScript", value: "javascript" },
  { name: "Python", value: "python" },
  { name: "Java", value: "java" },
  { name: "C++", value: "cpp" },
  { name: "C", value: "c" },
  { name: "Go", value: "go" },
  { name: "Rust", value: "rust" },
  { name: "PHP", value: "php" },
];

export default function OnlineIDE() {
  const [open, setOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("javascript");

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-online-ide-dialog", handleOpen);

    return () => {
      window.removeEventListener("open-online-ide-dialog", handleOpen);
    };
  }, []);

  const getCompilerUrl = () => {
    const baseUrl = `https://onecompiler.com/embed/${selectedLang}`;
    const params = new URLSearchParams({
      theme: 'dark',
      hideNew: 'false', // Allow creating new files
      hideRun: 'false', // Keep run button
      hideNewFileOption: 'false', // Allow new file creation
      hideStdin: 'false', // Keep STDIN for input
      hideResult: 'false', // Show results
      hideTitle: 'true', // Hide title for cleaner look
      fontSize: '16', // Better readability
      listenToEvents: 'true', // Enable event listening
      codeChangeEvent: 'true', // Enable code change events
      hideEditorOptions: 'false', // Keep editor options
      disableCopyPaste: 'false', // Allow copy/paste
      disableAutoComplete: 'false' // Keep autocomplete
    });
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl w-full h-[540px] bg-black text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Code Editor
            <select 
              value={selectedLang} 
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-600 text-sm"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.name}</option>
              ))}
            </select>
          </DialogTitle>
        </DialogHeader>
        <div className="w-full h-[450px]">
          <iframe
            src={`https://onecompiler.com/embed/${selectedLang}?theme=dark`}
            className="w-full h-full border-0 rounded-b-lg"
            allowFullScreen
            title="OneCompiler Embed"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
