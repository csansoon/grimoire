import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../../lib/utils";
import { Icon } from "./icon";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm",
            "transition-opacity duration-300",
            "data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
            className
        )}
        {...props}
    />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                "fixed z-50 w-full max-w-lg",
                // Mobile: bottom sheet style
                "bottom-0 left-0 right-0 max-h-[85vh]",
                // Styling
                "bg-grimoire-dark border-t border-mystic-gold/30 rounded-t-2xl",
                "overflow-hidden flex flex-col",
                // Animations
                "transition-transform duration-300 ease-out",
                "data-[state=open]:translate-y-0 data-[state=closed]:translate-y-full",
                className
            )}
            {...props}
        >
            {/* Handle bar */}
            <div className="flex justify-center py-3">
                <div className="w-12 h-1 rounded-full bg-parchment-500/30" />
            </div>
            {children}
            <DialogPrimitive.Close className="absolute right-4 top-4 p-2 rounded-full text-parchment-400 hover:text-parchment-100 hover:bg-white/10 transition-colors">
                <Icon name="x" size="md" />
                <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("px-6 pb-4 text-center", className)}
        {...props}
    />
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn(
            "font-tarot text-xl text-parchment-100 tracking-wider uppercase",
            className
        )}
        {...props}
    />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn("text-sm text-parchment-400", className)}
        {...props}
    />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const DialogBody = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("flex-1 overflow-y-auto px-6 pb-6", className)}
        {...props}
    />
);
DialogBody.displayName = "DialogBody";

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogBody,
};
