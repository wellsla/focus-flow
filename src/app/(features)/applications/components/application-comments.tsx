"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { MessageSquarePlus, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ApplicationComment } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ApplicationCommentsProps {
  comments: ApplicationComment[];
  onAddComment: (text: string) => void;
  onDeleteComment: (id: string) => void;
}

export function ApplicationComments({
  comments,
  onAddComment,
  onDeleteComment,
}: ApplicationCommentsProps) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment("");
    }
  };

  // Sort comments by date descending (newest first)
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquarePlus className="h-5 w-5" />
          Application Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment Form */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add feedback, interview notes, or any updates about this application..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="w-full"
          >
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            Add Comment
          </Button>
        </div>

        {/* Comments Timeline */}
        {sortedComments.length > 0 ? (
          <div className="space-y-4 mt-6">
            <Separator />
            <div className="space-y-4">
              {sortedComments.map((comment, index) => (
                <div
                  key={comment.id}
                  className="relative pl-6 pb-4 border-l-2 border-muted last:border-l-0 last:pb-0"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-primary border-4 border-background" />

                  {/* Comment Card */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span
                          title={format(new Date(comment.createdAt), "PPpp")}
                        >
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Latest
                          </Badge>
                        )}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this comment? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteComment(comment.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquarePlus className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs">Add your first comment to track progress</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
