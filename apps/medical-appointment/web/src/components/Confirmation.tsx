import type { Appointment } from "../types/openai";

interface Props {
    appointment: Appointment;
}

export function Confirmation({ appointment }: Props) {
    const { doctor, formattedDate, patient } = appointment;

    return (
        <div className="bg-green-50 rounded-xl p-6 text-center space-y-4">
            {/* Success icon */}
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-900">Consulta Confirmada!</h3>
                <p className="text-sm text-gray-600 mt-1">Você receberá uma confirmação por telefone.</p>
            </div>

            {/* Details card */}
            <div className="bg-white rounded-lg p-4 text-left space-y-3">
                <div className="flex items-center gap-3">
                    {doctor.imageUrl ? (
                        <img src={doctor.imageUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">{doctor.name.charAt(0)}</span>
                        </div>
                    )}
                    <div>
                        <p className="font-medium text-gray-900">{doctor.name}</p>
                        <p className="text-sm text-gray-500">{doctor.specialty}</p>
                    </div>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-700">{formattedDate}</span>
                    </div>

                    {doctor.address && (
                        <div className="flex items-start gap-2 text-sm">
                            <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-gray-700">
                                {doctor.address}
                                {doctor.city && `, ${doctor.city}`}
                                {doctor.state && ` - ${doctor.state}`}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-gray-700">{patient.name}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
