import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/store';
import { showToast } from '@/lib/toast';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthFormMode } from '@/types';

export function AuthForm() {
  const { register, login } = useAuthStore();
  const [mode, setMode] = useState<AuthFormMode>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  
  // Using react-hot-toast via our custom hook
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      showToast.error('Email and password are required');
      return;
    }
    
    const success = login(email, password);
    
    if (success) {
      showToast.success('Welcome back! You have successfully logged in.');
      navigate('/profile');
    } else {
      showToast.error('Login failed: Invalid email or password');
    }
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim() || !name.trim()) {
      showToast.error('Email, password, and name are required');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast.error('Please enter a valid email address');
      return;
    }
    
    // Password validation
    if (password.length < 6) {
      showToast.error('Password must be at least 6 characters long');
      return;
    }
    
    const success = register(email, password, name, location, profilePhoto);
    
    if (success) {
      showToast.success('Welcome! Your account has been created successfully.');
      navigate('/profile');
    } else {
      showToast.error('Registration failed: Email already exists. Please try another one.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Welcome to SkillXchange</CardTitle>
        <CardDescription>
          {mode === 'login' 
            ? 'Log in to your account'
            : 'Create your account to start swapping skills'}
        </CardDescription>
      </CardHeader>
      
      <Tabs value={mode} onValueChange={(value) => setMode(value as AuthFormMode)} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">Log in</Button>
            </CardFooter>
          </form>
        </TabsContent>
        
        <TabsContent value="register">
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-email">Email *</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password *</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters long.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-name">Name *</Label>
                <Input
                  id="register-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-location">Location (Optional)</Label>
                <Input
                  id="register-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your location"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-photo">Profile Photo (Optional)</Label>
                <div className="grid gap-4">
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProfilePhoto(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="text-xs text-muted-foreground">
                    Upload an image file from your computer
                  </div>
                </div>
                {profilePhoto && (
                  <div className="mt-4">
                    <img
                      src={profilePhoto}
                      alt="Profile Preview"
                      className="w-20 h-20 object-cover rounded-full border"
                      onError={() => {
                        showToast.error('Could not load the image');
                        setProfilePhoto('');
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">Create Account</Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}