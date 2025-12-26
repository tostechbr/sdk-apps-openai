import type { Doctor } from "../types/openai";

interface Props {
    doctors: Doctor[];
    onSelectDoctor: (doctor: Doctor) => void;
    isLoading?: boolean;
}

export function DoctorsList({ doctors, onSelectDoctor, isLoading }: Props) {
    if (doctors.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No doctors found.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {doctors.map((doctor) => (
                <div
                    key={doctor.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 hover:border-blue-300 transition-colors"
                >
                    <div className="flex-shrink-0">
                        {doctor.imageUrl ? (
                            <img
                                src={doctor.imageUrl}
                                alt={doctor.name}
                                className="w-14 h-14 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-lg">
                                    {doctor.name.charAt(0)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                            {doctor.name}
                        </h3>
                        <p className="text-sm text-gray-600">{doctor.specialty}</p>
                        {doctor.city && (
                            <p className="text-xs text-gray-400 mt-1">
                                {doctor.city}{doctor.state ? ` - ${doctor.state}` : ""}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => onSelectDoctor(doctor)}
                        disabled={isLoading}
                        className="self-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? "..." : "Ver horários"}
                    </button>
                </div>
            ))}
        </div>
    );
}
