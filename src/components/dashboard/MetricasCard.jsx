import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

const colorClasses = {
  green: {
    icon: "text-green-600",
    bg: "bg-green-50",
    gradient: "from-green-400 to-green-600"
  },
  blue: {
    icon: "text-blue-600", 
    bg: "bg-blue-50",
    gradient: "from-blue-400 to-blue-600"
  },
  purple: {
    icon: "text-purple-600",
    bg: "bg-purple-50", 
    gradient: "from-purple-400 to-purple-600"
  },
  orange: {
    icon: "text-orange-600",
    bg: "bg-orange-50",
    gradient: "from-orange-400 to-orange-600"
  }
};

export default function MetricasCard({ title, value, change, icon: Icon, trend, color = "blue" }) {
  const colors = colorClasses[color];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-effect border-0 premium-shadow hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
              </div>
              {change && (
                <div className="flex items-center gap-1 mt-2">
                  {trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : trend === 'down' ? (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  ) : null}
                  <span className={`text-xs font-medium ${
                    trend === 'up' ? 'text-green-600' : 
                    trend === 'down' ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {change}
                  </span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-xl ${colors.bg}`}>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${colors.gradient} flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}