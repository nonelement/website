import * as React from "react";

export enum NavStyle {
    Text,
    Icon,
    IconAndText,
}

export enum NavOrientation {
  Horizontal = "horizontal",
  Vertical = "vertical",
};


interface NavigationItemProps {
  name: string,
  link: string,
  style?: NavStyle,
}

// Supports Text links for now -- will support icons, icons w labels eventually
const NavigationItem: React.SFC = (props: NavigationItemProps) => {
  return (
    <div name={props.name}>
      <a
        className={props.name}
        href={props.link}
        alt={props.name}
      >
        {props.name}
      </a>
    </div>
  );
}


interface NavigationProps {
  navItems: Array<NavigationItemProps>,
  orientation: NavOrientation,
  style: NavStyle,
}

const navDefault: NavigationProps = {
  navItems: [],
  orientation: NavOrientation.Horizontal,
  style: NavStyle.Text,
}

export const Navigation: React.SFC = (props: NavigationProps = navDefault) => {
  // check orientation, add class

  return (
    <nav className={props.orientation} name="navigation">
    {
      props.navItems.map(item => {
        return <NavigationItem
          key={item.name}
          {...item}
          style={props.style}
        />
      )
    }
    </nav>
  )
}


