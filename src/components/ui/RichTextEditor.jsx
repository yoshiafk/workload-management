import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import './RichTextEditor.css';

const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link'],
        ['clean']
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link'
];

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Enter description...',
    label,
    error,
    className
}) {
    return (
        <div className={cn("rich-text-editor space-y-2", className)}>
            {label && <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">{label}</Label>}
            <div className={cn(
                "rounded-2xl overflow-hidden border transition-all",
                error ? "border-red-500 ring-1 ring-red-500" : "border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
            )}>
                <ReactQuill
                    theme="snow"
                    value={value || ''}
                    onChange={onChange}
                    placeholder={placeholder}
                    modules={modules}
                    formats={formats}
                />
            </div>
            {error && <span className="text-[10px] font-bold text-red-500 ml-1">{error}</span>}
        </div>
    );
}
