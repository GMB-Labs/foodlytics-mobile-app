import { Tabs } from "expo-router";

const _Layout = () => {
    return (
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    headerShown: false
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
