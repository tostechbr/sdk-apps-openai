import { useOpenAI } from "./hooks/useOpenAI";
import { DoctorsList } from "./components/DoctorsList";
import { SlotsList } from "./components/SlotsList";
import { Confirmation } from "./components/Confirmation";
import type { Doctor, Slot } from "./types/openai";

export default function App() {
    const { view, meta, isLoading, callTool, sendMessage } = useOpenAI();

    const handleSelectDoctor = async (doctor: Doctor) => {
        await callTool("get_available_slots", { doctorId: doctor.id });
    };

    const handleSelectSlot = (slot: Slot) => {
        // Trigger a follow-up message to prompt user for their info
        sendMessage(
            `Quero agendar o horário ${slot.formattedTime || slot.time}. Meu nome é [seu nome] e telefone [seu telefone].`
        );
    };

    const handleBackToDoctors = () => {
        // Go back to search - trigger a new search
        sendMessage("Mostrar médicos novamente");
    };

    // Loading state
    if (!meta && !isLoading) {
        return (
            <div className="p-4 text-center text-gray-500">
                <p>Aguardando dados...</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="p-8 flex justify-center">
                <div className="loading-spinner" />
            </div>
        );
    }

    // Route based on view
    switch (view) {
        case "doctors-list":
            return (
                <div className="p-4">
                    <DoctorsList
                        doctors={meta?.doctors || []}
                        onSelectDoctor={handleSelectDoctor}
                        isLoading={isLoading}
                    />
                </div>
            );

        case "slots-list":
            if (!meta?.doctor) {
                return <div className="p-4 text-gray-500">Médico não encontrado.</div>;
            }
            return (
                <div className="p-4">
                    <SlotsList
                        doctor={meta.doctor}
                        slots={meta.slots || []}
                        onSelectSlot={handleSelectSlot}
                        onBack={handleBackToDoctors}
                        isLoading={isLoading}
                    />
                </div>
            );

        case "confirmation":
            if (!meta?.appointment) {
                return <div className="p-4 text-gray-500">Confirmação não encontrada.</div>;
            }
            return (
                <div className="p-4">
                    <Confirmation appointment={meta.appointment} />
                </div>
            );

        case "disambiguation":
            return (
                <div className="p-4">
                    <p className="text-sm text-gray-600 mb-3">
                        Encontramos vários médicos. Escolha um:
                    </p>
                    <DoctorsList
                        doctors={meta?.matches || []}
                        onSelectDoctor={handleSelectDoctor}
                        isLoading={isLoading}
                    />
                </div>
            );

        default:
            return (
                <div className="p-4 text-center text-gray-500">
                    <p>Pergunte sobre médicos para começar.</p>
                </div>
            );
    }
}
