/** @jsxImportSource solid */
import { assertNever } from "../../core/mod.ts";
import { JSX } from "../../deps/solid.ts";
import { NestableSpan } from "./NestableSpan.tsx";
import { TreeText, TreeTextPart } from "./TreeText.ts";

export interface TreeTextViewProps {
  text: TreeText;
}

export const TreeTextView = (props: TreeTextViewProps) =>
  () => {
    const { text } = props;
    type Wrapper = {
      children: JSX.Element[];
      component: TreeTextPart.RangeStart["component"];
    };
    let wrapperStack: Wrapper[] = [{
      children: [],
      component: (props) => () => props.children,
    }];
    for (const part of text) {
      const currentWrapper = wrapperStack[wrapperStack.length - 1];
      if (part.kind === "string") {
        currentWrapper.children.push(part.string);
        continue;
      }
      if (part.kind === "ellipsis") {
        currentWrapper.children.push(
          <NestableSpan
            class="openable ellipsis"
            onClick={() => {
              part.target.open = true;
            }}
            children={"···"}
          />,
        );
        continue;
      }
      if (part.kind === "rangeStart") {
        wrapperStack.push({
          children: [],
          component: part.component,
        });
        continue;
      }
      if (part.kind === "rangeEnd") {
        const previousWrapper = wrapperStack[wrapperStack.length - 2];
        previousWrapper.children.push(
          <currentWrapper.component>
            {currentWrapper.children}
          </currentWrapper.component>,
        );
        wrapperStack.pop();
        continue;
      }
      assertNever(part);
    }
    return <span>{wrapperStack[wrapperStack.length - 1].children}</span>;
  };
