import React from "react";
import { Grid, Paper, Typography, Box } from "@mui/material";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  Tooltip, ResponsiveContainer
} from "recharts";

// Кольори, які відповідають твоїм карткам на скриншоті
const PIE_COLORS = ['#5cb85c', '#428bca', '#f0ad4e', '#d9534f'];
const BAR_COLORS = ['#f0ad4e', '#5cb85c', '#d9534f', '#5bc0de'];

export default function Charts({ pieData, barData }) {
  return (
    // Головний контейнер для графіків
    <Grid container spacing={3} sx={{ mt: 1 }}>
      
      {/* === КРУГОВИЙ ГРАФІК === */}
      {/* minWidth: 0 - це магія, яка не дає графіку сплющитися */}
      <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: "100%" }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2c3e50' }}>
            Звернення за категоріями
          </Typography>
          <Box sx={{ height: 350, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  cx="50%" cy="50%" 
                  outerRadius={110} 
                  dataKey="value" 
                  label
                >
                  {pieData.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      {/* === СТОВПЧАСТИЙ ГРАФІК === */}
      <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: "100%" }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2c3e50' }}>
            Статус обробки звернень
          </Typography>
          <Box sx={{ height: 350, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                
                {/* САМЕ ТУТ МИ ХОВАЄМО ТЕКСТ, ЩОБ ВІН НЕ ЗЛИПАВСЯ (tick={false}) */}
                <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} /> 
                
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
                
                <Bar dataKey="кількість" barSize={50} radius={[4, 4, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

    </Grid>
  );
}