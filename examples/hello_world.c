int main(void)
{
    char *TEST = "Hello World!";

    set_cursor(0);

    for (int i = 0; i < 12; i++)
    {
        write_char(TEST[i]);
        set_cursor(i);
    }
    
    write_char('%');
}