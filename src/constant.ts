import {
    HomeOutlined,
    HourglassBottomOutlined,
    PeopleOutlined,
    Settings,
    SnippetFolderOutlined,
    SvgIconComponent,
} from "@mui/icons-material";

interface IRouteList {
    display_name: string;
    dir: string;
    show_on_sidebar: boolean;
    icon: SvgIconComponent;
}

export enum EROUTE_LIST {
    Home,
    Shooters,
    Stages,
    Timer,
    TimerMenu,
    Setting,
}
export const ROUTE_LIST: IRouteList[] = [
    {
        display_name: "Home",
        dir: "/",
        show_on_sidebar: true,
        icon: HomeOutlined,
    },
    {
        display_name: "Shooters",
        dir: "/",
        show_on_sidebar: true,
        icon: PeopleOutlined,
    },
    {
        display_name: "Stages",
        dir: "/stages",
        show_on_sidebar: true,
        icon: SnippetFolderOutlined,
    },
    {
        display_name: "Timer",
        dir: "/timer",
        show_on_sidebar: true,
        icon: HourglassBottomOutlined,
    },
    {
        display_name: "Timer Menu",
        dir: "/timer/menu",
        show_on_sidebar: false,
        icon: HourglassBottomOutlined,
    },
    {
        display_name: "Settings",
        dir: "/settings",
        show_on_sidebar: true,
        icon: Settings,
    },
];
