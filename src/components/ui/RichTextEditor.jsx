/**
 * Rich Text Editor Component
 * Wrapper around react-quill for description fields
 */

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
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
    error 
}) {
    return (
        <div className="rich-text-editor">
            {label && <label className="form-label">{label}</label>}
            <ReactQuill
                theme="snow"
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                modules={modules}
                formats={formats}
            />
            {error && <span className="form-error">{error}</span>}
        </div>
    );
}
