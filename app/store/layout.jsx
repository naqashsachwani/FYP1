import StoreLayout from "@/components/store/StoreLayout";
import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs"

export const metadata = {
    title: "DreamSaver. - Your Dreams. Digitally Reserved",
    description: "DreamSaver. - Your Dreams. Digitally Reserved",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
        <SignedIn>
            <StoreLayout>
                {children}
            </StoreLayout>
        </SignedIn>
        <SignedOut>
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                 <SignIn 
                    fallbackRedirectUrl="/store" 
                    routing="hash" 
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "bg-white shadow-xl rounded-2xl"
                        }
                    }}
                 />
            </div>
        </SignedOut>
        </>
    );
}