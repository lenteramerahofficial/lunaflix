import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftIcon, AlertCircle, SendIcon, CheckCircle2Icon } from "lucide-react";
import { NotificationController } from "@/components/ui/notification";
import { Loader } from "@/components/ui/loader";
import { apiRequest } from "@/lib/queryClient";
import { getItem } from "@/lib/localStorage";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { Separator } from "@/components/ui/separator";

// Form schema for validation
const formSchema = z.object({
  otp: z
    .string()
    .min(4, { message: "OTP harus 4 digit" })
    .max(4, { message: "OTP harus 4 digit" })
    .regex(/^\d{4}$/, { message: "OTP hanya boleh berisi angka" }),
});

export default function Verification() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  
  useEffect(() => {
    // Get username from localStorage
    const savedUsername = getItem<string>("lunaflix_username");
    if (!savedUsername) {
      // If no username is found, redirect to login
      navigate("/");
      return;
    }
    
    setUsername(savedUsername);
    
    // Auto request OTP when page loads
    requestOtp(savedUsername);
  }, [navigate]);
  
  // Request OTP function
  const requestOtp = async (usernameParam: string) => {
    try {
      setIsLoading(true);
      setOtpError(null);
      
      // Request new OTP
      const response = await apiRequest("POST", "/api/auth/requestOtp", {
        username: usernameParam,
      });
      
      if (response.ok) {
        setOtpSent(true);
      } else {
        // Handle server errors
        if (response.error) {
          setOtpError(response.error || "Gagal mengirim OTP ke Telegram Anda");
        }
      }
    } catch (error) {
      console.error("Request OTP error:", error);
      setOtpError("Gagal terhubung ke server. Coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Auto-submit when 4 digits are entered
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (...event: any[]) => void) => {
    // Only allow digits
    const value = e.target.value.replace(/[^0-9]/g, '');
    onChange(value);
    
    // Auto-submit when 4 digits are entered
    if (value.length === 4 && /^\d{4}$/.test(value)) {
      form.handleSubmit(onSubmit)();
    }
  };
  
  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Handle verification form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      // Send OTP to server for verification
      const response = await apiRequest("POST", "/api/auth/verifyOtp", {
        username,
        otp: values.otp,
      });
      
      if (response.ok) {
        // Navigate to payment page
        navigate("/payment");
      } else {
        // Show error notification
        setOtpError("Kode OTP tidak valid atau telah kadaluarsa");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setOtpError("Terjadi kesalahan saat verifikasi. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async (showNotification: Function) => {
    try {
      setIsLoading(true);
      setOtpError(null);
      
      // Request a new OTP
      const response = await apiRequest("POST", "/api/auth/requestOtp", {
        username,
      });
      
      if (response.ok) {
        // Reset form and show notification
        form.reset();
        setOtpSent(true);
        showNotification("success", "OTP Terkirim", "Kode OTP baru telah dikirim ke Telegram Anda");
      } else {
        // Handle server errors
        if (response.error) {
          setOtpError(response.error || "Gagal mengirim OTP ke Telegram Anda");
          showNotification("error", "Gagal Mengirim OTP", response.error || "Pastikan Anda sudah memulai bot Telegram @lunaflix_bot");
        }
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setOtpError("Gagal terhubung ke server. Coba lagi nanti.");
      showNotification("error", "Gagal Mengirim OTP", "Terjadi kesalahan saat mengirim OTP. Coba lagi nanti.");
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
                <h1 className="text-3xl font-bold mb-3">Verifikasi OTP</h1>
                <p className="text-gray-300 text-sm">
                  {otpSent ? "Kode OTP telah dikirim ke Telegram Anda" : "Mengirim kode OTP ke Telegram Anda"}
                </p>
              </div>
              
              {/* Form */}
              <CardContent className="p-6">
                <div className="mb-6 text-center">
                  <p className="text-gray-300">
                    {otpSent ? (
                      <>Masukkan kode 4 digit yang telah dikirim ke</>
                    ) : (
                      <>Tunggu sebentar, kami sedang mengirim OTP ke</>
                    )}
                  </p>
                  <p className="font-medium text-white mt-1">{username}</p>
                </div>
                
                {/* Error message */}
                {otpError && (
                  <div className="mb-6 p-3 bg-red-900/30 border border-red-800 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-red-500 text-sm">{otpError}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Pastikan Anda telah memulai bot Telegram kami dengan mengetik <span className="font-mono bg-black/30 px-1 rounded">/start</span> ke <span className="font-semibold">@lunaflix_bot</span>
                      </p>
                    </div>
                  </div>
                )}
                
                {/* OTP Status */}
                {otpSent && !otpError && (
                  <div className="mb-6 p-3 bg-green-900/30 border border-green-800 rounded-md flex items-center">
                    <CheckCircle2Icon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <p className="text-green-400 text-sm">OTP berhasil dikirim ke Telegram Anda</p>
                  </div>
                )}
                
                <Separator className="my-6 bg-gray-700" />
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-300 text-center block">
                            Kode OTP
                          </FormLabel>
                          <div className="flex justify-center">
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                inputMode="numeric"
                                maxLength={4}
                                className="w-44 h-20 py-6 text-center text-3xl bg-netflix-gray text-white border-gray-600 focus:border-primary"
                                placeholder="0000"
                                onChange={(e) => handleInputChange(e, field.onChange)}
                                disabled={!otpSent || isLoading}
                              />
                            </FormControl>
                          </div>
                          <div className="text-center text-red-500">
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full py-6 rounded-md font-medium transition duration-200 hover-scale"
                      disabled={!otpSent || form.getValues("otp").length !== 4 || isLoading}
                    >
                      Verifikasi
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-4 text-center">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="text-primary border-primary hover:bg-primary/10 flex items-center"
                    onClick={() => handleResendOTP(showNotification)}
                    disabled={isLoading}
                  >
                    <SendIcon className="h-4 w-4 mr-2" />
                    Kirim Ulang Kode
                  </Button>
                </div>
                
                <div className="mt-8 mb-4">
                  <ProgressSteps 
                    currentStep={2} 
                    totalSteps={3} 
                    labels={["Login", "Verifikasi", "Pembayaran"]} 
                  />
                </div>
                
                <div className="mt-6 text-center">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="text-gray-300 hover:text-white"
                    onClick={() => navigate("/")}
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" /> Kembali
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </NotificationController>
  );
}
