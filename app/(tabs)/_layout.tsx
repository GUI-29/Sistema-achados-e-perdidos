import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Itens',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View style={styles.ic}><Text style={[styles.emoji, { color }]}>📦</Text></View>
          ),
        }}
      />
      <Tabs.Screen
        name="alunos"
        options={{
          title: 'Alunos',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View style={styles.ic}><Text style={[styles.emoji, { color }]}>👨‍🎓</Text></View>
          ),
        }}
      />
      <Tabs.Screen
        name="pesquisar"
        options={{
          title: 'Pesquisar',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View style={styles.ic}><Text style={[styles.emoji, { color }]}>🔎</Text></View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  ic: { alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22 },
});
