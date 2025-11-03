
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RoadmapNode, RoadmapNodeStatus } from '@/lib/types';
import { useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  status: z.enum(['todo', 'in_progress', 'done', 'skipped', 'parallel']),
});

type RoadmapNodeFormProps = {
  node?: RoadmapNode;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
};

export function RoadmapNodeForm({ node, onSubmit }: RoadmapNodeFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: node?.name || '',
      status: node?.status || 'todo',
    },
  });

  useEffect(() => {
    form.reset({
      name: node?.name || '',
      status: node?.status || 'todo',
    });
  }, [node, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Node Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., React.js" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress (Can talk about)</SelectItem>
                  <SelectItem value="done">Done (Proficient)</SelectItem>
                  <SelectItem value="skipped">Skipped (Not needed)</SelectItem>
                  <SelectItem value="parallel">In Parallel</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {node ? 'Update Node' : 'Add Node'}
        </Button>
      </form>
    </Form>
  );
}
