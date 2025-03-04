import { useEffect, useRef, useState } from 'react';
import { CircleUserRound } from 'lucide-react';

declare global {
    interface Window {
      cloudinary: any;
    }
}

export function UploadWidget({ onImageSelected }: { onImageSelected: (file: File) => void }) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      // Cria uma URL temporária para preview da imagem
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
      setSelectedFile(file);
      
      // Notifica o componente pai sobre o arquivo selecionado
      onImageSelected(file);
      
    }
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  // Limpa a URL do objeto quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return (
    <div className="flex flex-col items-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <div className="relative group">
        <button 
          onClick={handleUpload}
          className="w-32 h-32 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 relative overflow-hidden"
        >
          {imageUrl ? (
            <div className="relative w-full h-full">
              <img 
                src={imageUrl} 
                alt="Foto de perfil" 
                className="w-full h-full object-cover absolute inset-0"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity" />
            </div>
          ) : (
            <CircleUserRound className="w-16 h-16 text-gray-400" />
          )}
        </button>
        <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-sm text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Escolher imagem
        </span>
      </div>
    </div>
  );
}
