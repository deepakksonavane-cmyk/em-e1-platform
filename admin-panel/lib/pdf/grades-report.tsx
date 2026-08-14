import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 8, fontFamily: "Helvetica" },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 8, color: "#64748b", marginBottom: 14 },
  table: { display: "flex", flexDirection: "column", borderWidth: 1, borderColor: "#e2e8f0" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#e2e8f0" },
  headerRow: { backgroundColor: "#f1f5f9" },
  cell: { padding: 5, flex: 1, borderRightWidth: 1, borderColor: "#e2e8f0" },
  cellHeader: { padding: 5, flex: 1, borderRightWidth: 1, borderColor: "#e2e8f0", fontWeight: 700 },
});

interface GradeRow {
  studentId: string;
  name: string;
  batch: string;
  categoryScores: { category: string; avgPercent: number | null }[];
  overallPercent: number | null;
  letterGrade: string | null;
}

export async function renderGradesPdf(title: string, rows: GradeRow[]): Promise<Buffer> {
  const doc = (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          Weightage: 20% assignments · 20% case studies · 20% internship · 25% capstone · 10% participation · 5%
          final evaluation · Generated {new Date().toLocaleDateString()}
        </Text>
        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={styles.cellHeader}>Student ID</Text>
            <Text style={styles.cellHeader}>Name</Text>
            <Text style={styles.cellHeader}>Batch</Text>
            {rows[0]?.categoryScores.map((c) => (
              <Text style={styles.cellHeader} key={c.category}>
                {c.category}
              </Text>
            ))}
            <Text style={styles.cellHeader}>Overall</Text>
            <Text style={styles.cellHeader}>Grade</Text>
          </View>
          {rows.map((r) => (
            <View style={styles.row} key={r.studentId}>
              <Text style={styles.cell}>{r.studentId}</Text>
              <Text style={styles.cell}>{r.name}</Text>
              <Text style={styles.cell}>{r.batch}</Text>
              {r.categoryScores.map((c) => (
                <Text style={styles.cell} key={c.category}>
                  {c.avgPercent !== null ? `${Math.round(c.avgPercent)}%` : "—"}
                </Text>
              ))}
              <Text style={styles.cell}>{r.overallPercent !== null ? `${r.overallPercent}%` : "—"}</Text>
              <Text style={styles.cell}>{r.letterGrade || "—"}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
