import { MaterialIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";


const { width, height } = Dimensions.get('window');

const DataProductScreen = () => {
    return (
        <>
            <Stack.Screen
                options={{
                    header: () => (
                        <View style={[styles.appBar, { height: height * 0.12, paddingTop: height * 0.04 }]}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => router.back()}
                            >
                                <MaterialIcons name="arrow-back" size={width * 0.06} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.appBarText}>Product Menu</Text>
                            <View style={styles.backButton} />
                        </View>
                    ),
                }} 
            />
        </>
    )
}

const styles = StyleSheet.create({
     appBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#6c5ce7',
        paddingHorizontal: width * 0.04,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    backButton: {
        width: width * 0.1,
        height: width * 0.1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: width * 0.05,
    },
    appBarText: {
        color: '#fff',
        fontSize: width * 0.05,
        fontWeight: 'bold'
    },
})

export default DataProductScreen;