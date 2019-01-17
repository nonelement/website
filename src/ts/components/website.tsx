import * as React from "react";

import {Navigation, NavOrientation, NavStyle} from "./navigation/Navigation";
import {Anima} from "./cosmetic/Anima";

const navItems = [
  { name: 'twitter', link: 'http://twitter.com/nonelement' },
  { name: 'github', link: 'http://github.com/nonelement' },
  { name: 'blog', link: 'http://medium.com/@nonelement' },
]

export const Website: React.SFC = () => {
  return (
    <>
      <header name="about me">
        <h1 name="name">Anthony Kirkpatrick</h1>
        <h2 name="roles">Developer, UX</h2>
        <aside name="handle">@nonelement everywhere</aside>
      </header>
      <Navigation
        navItems={navItems}
        orientation={NavOrientation.Horizontal}
        style={NavStyle.Text}
      />
      <Anima />
    </>
  );
}
