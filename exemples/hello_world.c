int main(void)
{
    char *TEST = "Hello World!";

    // /!\\ C compiler is not fully working. Most of it are not implemented yet
    i = 0;
    for (int i = 0; i < 12; i++)
    {
        set_cursor(i);
        write_char(TEST[i]);
    }
}