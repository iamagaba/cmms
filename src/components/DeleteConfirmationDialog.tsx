import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert01Icon, Loading03Icon } from '@hugeicons/core-free-icons';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    itemName?: string;
    isDeleting?: boolean;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    itemName,
    isDeleting = false,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                        <HugeiconsIcon icon={Alert01Icon} size={24} className="text-destructive" />
                    </div>
                    <div className="flex-1 pt-1">
                        <DialogHeader>
                            <DialogTitle>{title}</DialogTitle>
                            <DialogDescription className="mt-2">
                                {message}
                            </DialogDescription>
                        </DialogHeader>

                        {itemName && (
                            <div className="mt-4 p-3 bg-muted rounded-md border text-sm font-medium">
                                {itemName}
                            </div>
                        )}

                        <DialogFooter className="mt-6 gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={onConfirm}
                                disabled={isDeleting}
                                className="gap-2"
                            >
                                {isDeleting && <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />}
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
