import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { chartStyles } from "./chartStyles";
const MAX_POINT = 100;

export const SubtestChartSection: React.FC<{ subtests: any[] }> = ({ subtests }) => (
  <View style={{ margin: '15 30' }}>
    {subtests.map((st, i) => {
      const point = st.result.subtest_point || 0;
      const pct = Math.min(100, Math.max(0, (point / MAX_POINT) * 100));
      return (
        <View key={i} style={chartStyles.container}>
          <Text style={chartStyles.title}>
            {st.subtest_name} ({st.subtest_code})
          </Text>

          <View style={chartStyles.barRow}>
            <Text style={chartStyles.minMaxText}>min:0</Text>

            <View style={chartStyles.barTrack}>
              <View
                style={[
                  chartStyles.barFill,
                  { width: `${pct}%` }, 
                ]}
              />
            </View>

            <Text style={chartStyles.minMaxText}>max:{MAX_POINT}</Text>
          </View>
        </View>
      );
    })}
  </View>
);
