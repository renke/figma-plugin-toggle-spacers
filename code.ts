const DEFAULT_SPACERS_PAGE_NAME = "Spacers";

const SPACERS_PAGE_NAME_PLUGIN_DATA_KEY = "pageName";

figma.parameters.on("input", ({ key, query, result }) => {
  if (key !== "page-name") {
    result.setError("Unknown parameter");

    return;
  }

  const pageNames = figma.root.children
    .filter((page) => page.name.startsWith(query))
    .map((page) => page.name);

  result.setSuggestions(
    pageNames.map((pageName) => {
      return {
        name: pageName,
      };
    })
  );
});

type Command = "toggleSpacers" | "changeSpacersPageName";

figma.on("run", ({ parameters }) => {
  const command = figma.command as Command;

  switch (command) {
    case "changeSpacersPageName": {
      changeSpacersPageName(
        parameters?.["page-name"] || DEFAULT_SPACERS_PAGE_NAME
      );

      return;
    }

    case "toggleSpacers": {
      const spacersPageName =
        figma.root.getPluginData(SPACERS_PAGE_NAME_PLUGIN_DATA_KEY) ||
        DEFAULT_SPACERS_PAGE_NAME;

      toggleSpacers(spacersPageName);

      return;
    }
  }
});

const changeSpacersPageName = (spacersPageName: string) => {
  figma.root.setPluginData(SPACERS_PAGE_NAME_PLUGIN_DATA_KEY, spacersPageName);

  figma.notify(`Setting spacers page to '${spacersPageName}'`);

  figma.closePlugin();
};

const toggleSpacers = (spacersPageName: string) => {
  const spacersPage = figma.root.children.find(
    (page) => page.name === spacersPageName
  );

  if (spacersPage === undefined) {
    figma.notify(
      `No page found with with name ${spacersPageName}. Please select another spacers page.`,
      {
        error: true,
      }
    );

    figma.closePlugin();

    return;
  }

  figma.skipInvisibleInstanceChildren = true;

  const components = spacersPage.findAllWithCriteria({
    types: ["COMPONENT", "COMPONENT_SET"],
  });

  if (components.length === 0) {
    figma.notify(
      `No spacer components found in page '${spacersPageName}'. Add your spacers components there.`,
      {
        error: true,
      }
    );

    figma.closePlugin();

    return;
  }

  const currentOpacity = components[0].opacity;

  const verb = currentOpacity === 0 ? "Showing" : "Hiding";

  figma.notify(`${verb} spacers`);

  for (const component of components) {
    component.opacity = currentOpacity === 0 ? 1 : 0;
  }

  figma.closePlugin();
};
