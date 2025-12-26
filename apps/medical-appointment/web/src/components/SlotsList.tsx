import type { Doctor, Slot } from "../types/openai";

interface Props {
    doctor: Doctor;
    slots: Slot[];
    onSelectSlot: (slot: Slot) => void;
    onBack: () => void;
    isLoading?: boolean;
}

export function SlotsList({ doctor, slots, onSelectSlot, onBack, isLoading }: Props) {
    return (
        <div className="space-y-4">
            {/* Doctor header */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <button
                    onClick={onBack}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Voltar"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="flex-shrink-0">
                    {doctor.imageUrl ? (
                        <img src={doctor.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">{doctor.name.charAt(0)}</span>
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                    <p className="text-sm text-gray-500">{doctor.specialty}</p>
                </div>
            </div>

            {/* Slots */}
            {slots.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                    Nenhum horário disponível no momento.
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {slots.map((slot) => (
                        <button
                            key={slot.id}
                            onClick={() => onSelectSlot(slot)}
                            disabled={isLoading}
                            className="p-3 bg-white border border-gray-200 rounded-lg text-center hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 transition-colors"
                        >
                            <div className="text-sm font-medium text-gray-900">
                                {slot.formattedTime || new Date(slot.time).toLocaleString("pt-BR", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
