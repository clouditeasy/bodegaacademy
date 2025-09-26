import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { azureStorage } from '../../lib/azureStorage';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Tapez votre contenu ici...",
  height = 400 
}: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);

  // Fonction de callback stable pour éviter les re-renders
  const handleChange = useCallback((content: string) => {
    onChange(content);
  }, [onChange]);

  // Configurer les événements de paste après le montage du composant
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const handleQuillPaste = async (event: ClipboardEvent) => {
      if (!azureStorage.isConfigured()) return;
      
      const clipboardData = event.clipboardData;
      if (!clipboardData) return;

      const items = Array.from(clipboardData.items);
      const imageItem = items.find(item => item.type.startsWith('image/'));
      
      if (!imageItem) return;

      event.preventDefault();
      
      const file = imageItem.getAsFile();
      if (!file) return;

      const range = quill.getSelection();
      if (!range) return;

      try {
        // Générer un nom de fichier unique
        const timestamp = Date.now();
        const extension = file.type.split('/')[1] || 'png';
        const fileName = `images/paste_${timestamp}.${extension}`;
        
        // Insérer un placeholder pendant l'upload
        quill.insertText(range.index, 'Image en cours de téléchargement...', 'user');
        
        // Upload vers Azure Storage
        const imageUrl = await azureStorage.uploadFile(file, fileName);
        
        console.log('Image collée uploadée avec succès:', imageUrl);
        
        // Supprimer le placeholder
        quill.deleteText(range.index, 'Image en cours de téléchargement...'.length);
        
        // Insérer l'image
        quill.insertEmbed(range.index, 'image', imageUrl, 'user');
        quill.setSelection(range.index + 1, 0);
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        alert('Erreur lors du téléchargement de l\'image');
        
        // Supprimer le placeholder en cas d'erreur
        const currentRange = quill.getSelection();
        if (currentRange) {
          quill.deleteText(range.index, 'Image en cours de téléchargement...'.length);
        }
      }
    };

    const editorElement = quill.root;
    editorElement.addEventListener('paste', handleQuillPaste);

    return () => {
      editorElement.removeEventListener('paste', handleQuillPaste);
    };
  }, []);

  // Upload d'image vers Azure Storage
  const imageHandler = useCallback(async () => {
    if (!azureStorage.isConfigured()) {
      alert('Le stockage d\'images n\'est pas configuré');
      return;
    }

    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image');
        return;
      }

      const quill = quillRef.current?.getEditor();
      if (!quill) return;

      const range = quill.getSelection();
      if (!range) return;

      try {
        // Générer un nom de fichier unique
        const timestamp = Date.now();
        const fileName = `images/${timestamp}_${file.name}`;
        
        // Insérer un placeholder pendant l'upload
        quill.insertText(range.index, 'Téléchargement en cours...', 'user');
        
        // Upload vers Azure Storage
        const imageUrl = await azureStorage.uploadFile(file, fileName);
        
        console.log('Image uploadée avec succès:', imageUrl);
        
        // Supprimer le placeholder
        quill.deleteText(range.index, 'Téléchargement en cours...'.length);
        
        // Insérer l'image
        quill.insertEmbed(range.index, 'image', imageUrl, 'user');
        quill.setSelection(range.index + 1, 0);
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        alert('Erreur lors du téléchargement de l\'image');
        
        // Supprimer le placeholder en cas d'erreur
        const currentRange = quill.getSelection();
        if (currentRange) {
          quill.deleteText(range.index, 'Téléchargement en cours...'.length);
        }
      }
    };
  }, []);


  // Configuration de la barre d'outils - simple et user-friendly
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        // Formatage de base
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        
        // Listes et alignement
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        
        // Couleurs et liens
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image'],
        
        // Nettoyage
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
  }), [imageHandler]);

  // Formats supportés
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'color', 'background',
    'link',
    'image'
  ];

  return (
    <div className="w-full">
      <style>{`
        /* Personnalisation de l'éditeur Quill */
        .ql-editor {
          min-height: ${height}px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          font-size: 16px;
          line-height: 1.6;
          color: #374151;
        }
        
        .ql-editor h1 {
          color: #1f2937;
          font-size: 2rem;
          font-weight: bold;
          margin: 1.5rem 0 1rem 0;
        }
        
        .ql-editor h2 {
          color: #374151;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.25rem 0 0.75rem 0;
        }
        
        .ql-editor h3 {
          color: #4b5563;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
        }
        
        .ql-editor p {
          margin-bottom: 1rem;
        }
        
        .ql-editor ul, .ql-editor ol {
          margin-bottom: 1rem;
          padding-left: 2rem;
        }
        
        .ql-editor li {
          margin-bottom: 0.5rem;
        }
        
        .ql-toolbar {
          border-top: 1px solid #d1d5db;
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          border-bottom: none;
          background: #f9fafb;
        }
        
        .ql-container {
          border-bottom: 1px solid #d1d5db;
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          border-top: none;
        }
        
        .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        
        .ql-editor img {
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
          border-radius: 8px;
        }
      `}</style>
      
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        theme="snow"
      />
    </div>
  );
}