import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createUserWithEmailAndPassword , signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase-config";
import { Navigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase-config';
import { UploadWidget } from '@/components/uploadWidget';
import { toast } from "sonner"

interface CreateUserProps {
  // onSubmit: (data: UserData) => void;
}

interface UserData {
  companyName: string;
  email: string;
  password: string;
  path: string;
  imageUrl: string | File;
}

export function CreateUser({user}) {
  const [formData, setFormData] = useState<UserData>({
    companyName: '',
    email: '',
    password: '',
    path: '',
    imageUrl: ''
  });

  const [inSignUpActive, setInSignUpActive] = useState(false);

  const handleMethodChange = () => {
    setInSignUpActive(!inSignUpActive);
  };


  const handleSingnup = () => {
    if(!formData.email || !formData.password) {
      return;
    }
    createUserWithEmailAndPassword(auth, formData.email, formData.password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        
        // First create the user document without the image URL
        return setDoc(doc(db, 'estabelecimento', user.uid), {
          nome: formData.companyName,
          rota: formData.path,
          userId: user.uid,
          imageUrl: '' // Initialize with empty string
        });
      })
      .then(() => {
        // After user is created, handle the image upload if there's a file
        if (formData.imageUrl) {
          const formDataImg = new FormData();
          formDataImg.append('file', formData.imageUrl);
          formDataImg.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

          return fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formDataImg
          })
          .then(response => response.json())
          .then(data => {
            // Update the document with the image URL
            return setDoc(doc(db, 'estabelecimento', auth.currentUser.uid), {
              nome: formData.companyName,
              rota: formData.path,
              userId: auth.currentUser.uid,
              imageUrl: data.secure_url
            });
          });
        }
      })
      .then(() => {
        console.log('Estabelecimento criado com sucesso');
        toast.success('Conta criada com sucesso!');
      })
      .catch((error) => {
        console.log(error);
        if (error.code === 'auth/email-already-in-use') {
          toast.error('Este email já está em uso. Por favor, use outro email ou faça login.');
        } else {
          toast.error('Ocorreu um erro ao criar a conta. Tente novamente.');
        }
      });
  };

  const handleSignin = () => {
    if(!formData.email || !formData.password) {
      return;
    }
    signInWithEmailAndPassword(auth, formData.email, formData.password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log(user);
    })
    .catch((error) => {
      console.log(error);
    });
    
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // onSubmit(formData);
    console.log(formData);
  };

  const handleImageSelected = (file: File) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: file
    }));
  };

  if(user) {
    return <Navigate to="/painel" />
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {inSignUpActive ? 'Criar Nova Conta' : 'Entrar'}
          </CardTitle>
        </CardHeader>

        {inSignUpActive && (
          <UploadWidget onImageSelected={handleImageSelected}/>
        )}

        <CardContent className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {inSignUpActive && (
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
              </div>
            )}

            {inSignUpActive && (
              <div className="space-y-2">
                <Label htmlFor="path">Caminho</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    /
                  </span>
                  <Input
                    type="text"
                    id="path"
                    name="path"
                    value={formData.path}
                    onChange={handleChange}
                    placeholder="Exemplo: superlanches"
                    className="rounded-l-none"
                    required
                  />
                </div>
              </div>
            )}

            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {inSignUpActive && (
              <Button type="submit" className="w-full" onClick={handleSingnup}>
                Cadastrar
              </Button>
            )}

            {!inSignUpActive && (
              <Button type="submit" className="w-full" onClick={handleSignin}>
                Entrar
              </Button>
            )}


            <button 
              type="button" 
              className="text-sm text-gray-600 hover:text-gray-900 mt-2 text-left"
              onClick={handleMethodChange}
            >
              {inSignUpActive ? 'Entrar' : 'Cadastrar'}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 