import { icons } from "@/src/shared/constants/icons";
import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, Text, View } from "react-native";

interface TabIconProps {
    source: ImageSourcePropType;
    label: string;
    focused: boolean;
};

const TabIcon = ({ source, label, focused }: TabIconProps) => {

    return (focused ? (
        <View className="min-w-[112px] flex justify-center items-center">
            <Image source={source}/>
            <Text className="text-blue-500">{label}</Text>
        </View>
    )
        :
        <View className="bg-blue-400">
            <Text className="text-white">{label}</Text>
        </View>
    )
}

const _Layout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarItemStyle: {
                    width: '100%',
                    height: '100%',
                    marginTop: 15,
                    justifyContent: 'center',
                    alignItems: 'center'
                },
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderRadius: 0,
                    marginHorizontal: 0,
                    marginBottom: 0,
                    height: 80,
                    position: 'absolute',
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: '#ffffff'
                }
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => <TabIcon source={icons.home} label="Home" focused={focused}/>
                }}
            />
            {/*
            <Tabs.Screen
            />
            <Tabs.Screen
            />
            <Tabs.Screen
            /> 
            */}
        </Tabs>
    )
};

export default _Layout;
