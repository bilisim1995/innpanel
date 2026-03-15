"use client";

import {
  Route, Clock, MapPin, Zap, Users, Star, Award,
  Info, Check, X, Sparkles
} from "lucide-react";
import { AssignmentData } from "@/lib/assignments";
import { useTranslation } from 'react-i18next';

interface ServiceTourDetailsProps {
  assignment: AssignmentData;
  service: any;
  theme: any;
}

export function ServiceTourDetails({ assignment, service, theme }: ServiceTourDetailsProps) {
  const { t } = useTranslation();
  const accentColor = theme.customStyle?.backgroundColor || '#dc2626';

  const convertToMinutes = (hours: string | number) => {
    const numHours = typeof hours === 'string' ? parseFloat(hours) : hours;
    return Math.round(numHours * 60);
  };

  const stats: { icon: any; label: string; value: string }[] = [];

  // Süre
  if (assignment.serviceCategory === "balloon" && service.categoryDetails?.flightInfo?.duration) {
    stats.push({ icon: Clock, label: t('duration_label'), value: `${service.categoryDetails.flightInfo.duration} ${t('minutes_suffix')}` });
  } else if (assignment.serviceCategory === "motor-tours" && service.categoryDetails?.routeDetails?.duration) {
    stats.push({ icon: Clock, label: t('duration_label'), value: `${service.categoryDetails.routeDetails.duration} ${t('minutes_suffix')}` });
  } else if (assignment.serviceCategory === "transfer" && service.categoryDetails?.routeDetails?.duration) {
    stats.push({ icon: Clock, label: t('duration_label'), value: `${service.categoryDetails.routeDetails.duration} ${t('minutes_suffix')}` });
  } else if (assignment.serviceCategory === "other" && service.categoryDetails?.serviceDuration?.value) {
    stats.push({ icon: Clock, label: t('duration_label'), value: `${convertToMinutes(service.categoryDetails.serviceDuration.value)} ${t('minutes_suffix')}` });
  }

  // Başlangıç Noktası
  if (assignment.serviceCategory === "balloon" && service.categoryDetails?.flightInfo?.departurePoint) {
    stats.push({ icon: MapPin, label: t('departure_point_label'), value: service.categoryDetails.flightInfo.departurePoint });
  } else if (assignment.serviceCategory === "motor-tours" && service.categoryDetails?.routeDetails?.startPoint) {
    stats.push({ icon: MapPin, label: t('departure_point_label'), value: service.categoryDetails.routeDetails.startPoint });
  } else if (assignment.serviceCategory === "transfer" && service.categoryDetails?.routeDetails?.startPoint) {
    stats.push({ icon: MapPin, label: t('departure_point_label'), value: service.categoryDetails.routeDetails.startPoint });
  }

  // Bitiş Noktası
  if (assignment.serviceCategory === "motor-tours" && service.categoryDetails?.routeDetails?.endPoint) {
    stats.push({ icon: MapPin, label: t('end_point_label'), value: service.categoryDetails.routeDetails.endPoint });
  } else if (assignment.serviceCategory === "transfer" && service.categoryDetails?.routeDetails?.endPoint) {
    stats.push({ icon: MapPin, label: t('end_point_label'), value: service.categoryDetails.routeDetails.endPoint });
  }

  // Mesafe
  if (assignment.serviceCategory === "motor-tours" && service.categoryDetails?.routeDetails?.distance) {
    stats.push({ icon: Route, label: t('distance_label'), value: `${service.categoryDetails.routeDetails.distance} ${t('km_suffix')}` });
  } else if (assignment.serviceCategory === "transfer" && service.categoryDetails?.routeDetails?.distance) {
    stats.push({ icon: Route, label: t('distance_label'), value: `${service.categoryDetails.routeDetails.distance} ${t('km_suffix')}` });
  }

  // Zorluk
  if (assignment.serviceCategory === "motor-tours" && service.categoryDetails?.difficulty) {
    const diffLabel = service.categoryDetails.difficulty === "easy" ? t('difficulty_easy') :
      service.categoryDetails.difficulty === "medium" ? t('difficulty_medium') :
      service.categoryDetails.difficulty === "hard" ? t('difficulty_hard') : service.categoryDetails.difficulty;
    stats.push({ icon: Zap, label: t('difficulty_level_label'), value: diffLabel });
  }

  // Min Yaş
  if (assignment.serviceCategory === "motor-tours" && service.categoryDetails?.minAge) {
    stats.push({ icon: Users, label: t('min_participant_age_label'), value: `${service.categoryDetails.minAge} ${t('age_suffix')}` });
  }

  const hasDepartureTimes = assignment.serviceCategory === "region-tours" &&
    service.categoryDetails?.departureTimes?.length > 0;

  const hasRegionTourDetails = assignment.serviceCategory === "region-tours";

  if (stats.length === 0 && !hasDepartureTimes && !hasRegionTourDetails) return null;

  return (
    <div className="space-y-6">
      {/* Stats Strip */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: accentColor }} />
                  <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
                </div>
                <p className="text-gray-800 font-semibold text-sm">{stat.value}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Kalkış Saatleri (Region Tours) - Timeline */}
      {hasDepartureTimes && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: accentColor }} />
            {t('departure_times_prices_title')}
          </h3>
          <div className="space-y-2">
            {service.categoryDetails.departureTimes.map((time: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span className="font-semibold text-gray-800">{time.time}</span>
                </div>
                <span className="font-bold" style={{ color: accentColor }}>
                  {time.price} ₺
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Region Tours - Tur Bilgisi */}
      {hasRegionTourDetails && service.categoryDetails?.tourInfo && (
        <div
          className="bg-gray-50/80 rounded-r-xl py-4 px-5 border-l-4"
          style={{ borderLeftColor: accentColor }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4" style={{ color: accentColor }} />
            <span className="text-sm font-semibold text-gray-800">{t('tour_info_description_title')}</span>
          </div>
          <p className="text-gray-700 leading-relaxed text-sm">
            {service.categoryDetails.tourInfo}
          </p>
        </div>
      )}

      {/* Region Tours - Dahil / Hariç */}
      {hasRegionTourDetails && (service.categoryDetails?.included || service.categoryDetails?.excluded) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {service.categoryDetails?.included && (
            <div className="bg-white rounded-xl p-5 border border-emerald-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="text-sm font-semibold text-emerald-700">{t('tour_included_title')}</span>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">
                {service.categoryDetails.included}
              </p>
            </div>
          )}
          {service.categoryDetails?.excluded && (
            <div className="bg-white rounded-xl p-5 border border-rose-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center">
                  <X className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <span className="text-sm font-semibold text-rose-600">{t('tour_excluded_title')}</span>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">
                {service.categoryDetails.excluded}
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIP Badge */}
      {hasRegionTourDetails && service.categoryDetails?.isVIP && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200/60">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-sm">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <span className="font-semibold text-amber-900 text-sm">{t('vip_tour_title')}</span>
            <p className="text-amber-700 text-xs">{t('vip_tour_description')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
