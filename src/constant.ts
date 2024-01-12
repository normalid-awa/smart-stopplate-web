import {
    HomeOutlined,
    HourglassBottomOutlined,
    PeopleOutlined,
    Settings,
    SnippetFolderOutlined,
    SportsScoreOutlined,
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
    Scoreboards,
    Scorelists,
    Scores,
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
        display_name: "Scoreboards",
        dir: "/scoreboards",
        show_on_sidebar: true,
        icon: SportsScoreOutlined,
    },
    {
        display_name: "Scorelists",
        dir: "/scorelists",
        show_on_sidebar: false,
        icon: SportsScoreOutlined,
    },
    {
        display_name: "Scores",
        dir: "/scores",
        show_on_sidebar: false,
        icon: SportsScoreOutlined,
    },
    {
        display_name: "Shooters",
        dir: "/shooters",
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

export const __DEV__ = true;