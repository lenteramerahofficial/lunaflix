import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AtSignIcon, AlertCircle } from "lucide-react";
import { NotificationController } from "@/components/ui/notification";
import { Loader } from "@/components/ui/loader";
import { apiRequest } from "@/lib/queryClient";
import { setItem } from "@/lib/localStorage";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { Separator } from "@/components/ui/separator";

// Form schema for validation - we'll add @ prefix automatically
const formSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Username harus diisi" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username hanya boleh mengandung huruf, angka, dan underscore",
    }),
});

export default function Login() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
    mode: "onChange",
  });

  // Watch form values to enable/disable button
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.username && value.username.length > 0 && !form.formState.errors.username) {
        setIsButtonDisabled(false);
      } else {
        setIsButtonDisabled(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, form.formState.errors]);

  // Handle login form submission
  const onSubmit = async (values: z.infer<typeof formSchema>, showNotification: Function) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add @ prefix if not already present
      const username = values.username.startsWith('@') ? values.username : `@${values.username}`;
      
      // Send username to server to request OTP
      const response = await apiRequest("POST", "/api/auth/requestOtp", {
        username: username,
      });
      
      if (response.ok) {
        // Store username in localStorage to use in verification page
        setItem("lunaflix_username", username);
        
        // Show success notification
        showNotification("success", "Berhasil", "Kode OTP telah dikirim ke Telegram Anda");
        
        // Navigate to verification page
        navigate("/verification");
      } else {
        // Handle errors
        if (response.error) {
          setError(response.error);
          showNotification("error", "Gagal", response.error);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Terjadi kesalahan saat memproses permintaan. Coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NotificationController>
      {({ showNotification }) => (
        <div className="flex-1 flex flex-col min-h-screen bg-netflix-black">
          {isLoading && <Loader text="Memproses..." />}
          
          {/* Netflix-inspired header */}
          <header className="w-full p-4 flex items-center">
            <h1 className="text-primary font-extrabold text-4xl tracking-tighter logo-text">LUNAFLIX</h1>
          </header>
          
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-netflix-dark-gray rounded-md border-0 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-8 text-white">
                <h1 className="text-3xl font-bold mb-3">Masuk</h1>
                <p className="text-gray-300 text-sm">Untuk melanjutkan ke LunaFlix</p>
              </div>
              
              {/* Form */}
              <CardContent className="p-6">
                {/* Error message */}
                {error && (
                  <div className="mb-6 p-3 bg-red-900/30 border border-red-800 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-red-500 text-sm">{error}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Pastikan Anda memasukkan username Telegram yang benar dan telah memulai bot kami dengan mengetik <span className="font-mono bg-black/30 px-1 rounded">/start</span> ke <span className="font-semibold">@lunaflix_bot</span>
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="mb-6">
                  <h2 className="text-white font-medium mb-1">Langkah-langkah Verifikasi:</h2>
                  <ul className="text-gray-400 text-sm space-y-1 list-disc pl-5">
                    <li>Masukkan username Telegram Anda (tanpa @)</li>
                    <li>Mulai chat dengan <span className="text-primary">@lunaflix_bot</span> di Telegram</li>
                    <li>Ketik <span className="font-mono bg-black/30 px-1 rounded">/start</span> ke bot</li>
                    <li>Anda akan menerima kode OTP 2 digit untuk verifikasi</li>
                  </ul>
                </div>
                
                <Separator className="my-6 bg-gray-700" />
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((values) => onSubmit(values, showNotification))} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-300">
                            Username Telegram
                          </FormLabel>
                          <div className="relative">
                            <FormControl>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                  <AtSignIcon className="h-5 w-5" />
                                </span>
                                <Input
                                  {...field}
                                  placeholder="username"
                                  className="pl-10 bg-netflix-gray text-white border-gray-600 focus:border-primary"
                                />
                              </div>
                            </FormControl>
                          </div>
                          <div className="text-red-500">
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full py-6 rounded-md font-medium transition duration-200 hover-scale"
                      disabled={isButtonDisabled}
                    >
                      Lanjutkan
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-8 mb-4">
                  <ProgressSteps 
                    currentStep={1} 
                    totalSteps={3} 
                    labels={["Login", "Verifikasi", "Pembayaran"]} 
                  />
                </div>
                
                <div className="mt-6 text-center text-sm text-gray-400">
                  <p>Dengan melanjutkan, Anda menyetujui syarat dan ketentuan layanan kami.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </NotificationController>
  );
}
