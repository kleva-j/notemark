import type { ComponentProps } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNoteOperations } from "@/store";
import { useForm } from "react-hook-form";
import { SidebarTabs } from "@/models";
import { toast } from "sonner";
import { z } from "zod";

import {
  FormMessage,
  FormControl,
  FormLabel,
  FormField,
  FormItem,
  Form,
} from "@/components/ui/form";

import {
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
  Dialog,
} from "@/components/ui/dialog";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(30, "Title is too long"),
  content: z.string(),
  category: z.enum(SidebarTabs),
});

export type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  title: "",
  content: "",
  category: SidebarTabs.inbox,
};

const resolver = zodResolver(formSchema);

interface NotePopoverProps extends ComponentProps<"div"> {
  show: boolean;
  onClose: () => void;
}

export const CreateNoteDialog = (props: NotePopoverProps) => {
  const { show, onClose } = props;
  const { createNote } = useNoteOperations();

  const form = useForm<FormValues>({ resolver, defaultValues });

  const onSubmit = (data: FormValues) => {
    const { title, content, category } = data;
    createNote(title, category, content);
    form.reset();
    onClose();
    toast("Note created successfully");
  };

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>New Note</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new note.
              </DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter note title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter note content"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      {Object.values(SidebarTabs).map((tab) => (
                        <option key={tab} value={tab}>
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Note"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
