import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLocationSchema, type InsertLocation } from "@shared/schema";
import { useCreateLocation } from "@/hooks/use-locations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface AddLocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  coordinates: { lat: number; lng: number } | null;
}

export function AddLocationDialog({ isOpen, onClose, coordinates }: AddLocationDialogProps) {
  const { isAuthenticated } = useAuth();
  const createLocation = useCreateLocation();

  const form = useForm<InsertLocation>({
    resolver: zodResolver(insertLocationSchema),
    defaultValues: {
      name: "",
      description: "",
      latitude: coordinates?.lat || 0,
      longitude: coordinates?.lng || 0,
    },
    values: coordinates ? {
      name: "",
      description: "",
      latitude: coordinates.lat,
      longitude: coordinates.lng,
    } : undefined,
  });

  const onSubmit = (data: InsertLocation) => {
    console.log("Submitting location data:", data);
    createLocation.mutate(data, {
      onSuccess: () => {
        console.log("Location created successfully");
        form.reset();
        onClose();
      },
      onError: (error) => {
        console.error("Location creation error detail:", error);
      }
    });
  };

  if (!isAuthenticated && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>サインインが必要です</DialogTitle>
            <DialogDescription>
              新しい場所を地図に追加するには、サインインしてください。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>キャンセル</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新しい場所を追加</DialogTitle>
          <DialogDescription>
            地図上に新しいおすすめスポットを登録しましょう。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名前</FormLabel>
                  <FormControl>
                    <Input placeholder="例：隠れ家カフェ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>説明</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="この場所の魅力を教えてください" 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>緯度</FormLabel>
                    <FormControl>
                      <Input disabled {...field} value={field.value?.toFixed(6)} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>経度</FormLabel>
                    <FormControl>
                      <Input disabled {...field} value={field.value?.toFixed(6)} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={onClose}>
                キャンセル
              </Button>
              <Button type="submit" disabled={createLocation.isPending}>
                {createLocation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                場所を作成
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
